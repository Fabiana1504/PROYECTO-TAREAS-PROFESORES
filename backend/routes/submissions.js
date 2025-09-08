const express = require('express');
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const { auth, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get all submissions
router.get('/', auth, async (req, res) => {
  try {
    const { task, student, status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Students can only see their own submissions
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }
    
    // Professors can filter by task, student, and status
    if (req.user.role === 'professor') {
      if (task) query.task = task;
      if (student) query.student = student;
      if (status) query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate('task', 'title description dueDate maxScore')
      .populate('student', 'name email')
      .populate('gradedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments(query);

    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submission by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('task', 'title description dueDate maxScore professor')
      .populate('student', 'name email')
      .populate('gradedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Students can only see their own submissions
    if (req.user.role === 'student' && submission.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Professors can only see submissions for their tasks
    if (req.user.role === 'professor' && submission.task.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create submission (students only)
router.post('/', auth, authorize('student'), upload.single('file'), handleUploadError, async (req, res) => {
  try {
    console.log('🔍 SUBMISSION DEBUG:');
    console.log('  - req.body:', req.body);
    console.log('  - req.file:', req.file);
    console.log('  - req.user:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('  - Content-Type:', req.get('Content-Type'));
    console.log('  - Headers:', req.headers);

    const { taskId, comments } = req.body;
    const task = taskId;

    // Validate required fields
    if (!taskId) {
      console.log('❌ No taskId provided');
      return res.status(400).json({ message: 'Task ID is required' });
    }

    if (!req.file) {
      console.log('❌ No file received');
      console.log('  - req.file is:', req.file);
      return res.status(400).json({ message: 'File is required' });
    }

    // Check if task exists and is published
    const taskDoc = await Task.findById(task);
    if (!taskDoc) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (taskDoc.status !== 'published') {
      return res.status(400).json({ message: 'Task is not published' });
    }

    // Check if student is assigned to this task
    if (!taskDoc.assignedTo.some(student => student.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({ task, student: req.user._id });
    if (existingSubmission) {
      return res.status(400).json({ message: 'Submission already exists for this task' });
    }

    const submissionData = {
      task,
      student: req.user._id,
      content: comments || ''
    };

    // Handle file attachment
    submissionData.attachments = [{
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    }];

    const submission = new Submission(submissionData);
    await submission.save();

    await submission.populate('task', 'title description dueDate maxScore');
    await submission.populate('student', 'name email');

    res.status(201).json({
      message: 'Submission created successfully',
      submission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Update submission (students only)
router.put('/:id', auth, authorize('student'), upload.array('attachments', 5), handleUploadError, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if submission belongs to the student
    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if submission is not already graded
    if (submission.status === 'graded') {
      return res.status(400).json({ message: 'Cannot update graded submission' });
    }

    const { content } = req.body;

    if (content !== undefined) submission.content = content;

    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }));
      submission.attachments.push(...newAttachments);
    }

    await submission.save();
    await submission.populate('task', 'title description dueDate maxScore');
    await submission.populate('student', 'name email');

    res.json({
      message: 'Submission updated successfully',
      submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Grade submission (professors only)
router.patch('/:id/grade', auth, authorize('professor'), async (req, res) => {
  try {
    const { score, feedback } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('task', 'professor maxScore');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if task belongs to the professor
    if (submission.task.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate score
    if (score < 0 || score > submission.task.maxScore) {
      return res.status(400).json({ 
        message: `Score must be between 0 and ${submission.task.maxScore}` 
      });
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();
    await submission.populate('student', 'name email');
    await submission.populate('gradedBy', 'name email');

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Return submission to student (professors only)
router.patch('/:id/return', auth, authorize('professor'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('task', 'professor');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if task belongs to the professor
    if (submission.task.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    submission.status = 'returned';
    await submission.save();

    res.json({
      message: 'Submission returned to student successfully',
      submission
    });
  } catch (error) {
    console.error('Return submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete submission (students only)
router.delete('/:id', auth, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if submission belongs to the student
    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if submission is not already graded
    if (submission.status === 'graded') {
      return res.status(400).json({ message: 'Cannot delete graded submission' });
    }

    await Submission.findByIdAndDelete(req.params.id);

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
