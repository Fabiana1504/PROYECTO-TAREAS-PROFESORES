const express = require('express');
const Task = require('../models/Task');
const { auth, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, professor, assignedTo, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Students can only see tasks assigned to them
    if (req.user.role === 'student') {
      query.assignedTo = req.user._id;
    }
    
    // Professors can filter by status and assigned students
    if (req.user.role === 'professor') {
      if (status) query.status = status;
      if (professor) query.professor = professor;
      if (assignedTo) query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('professor', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('professor', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Students can only see tasks assigned to them
    if (req.user.role === 'student' && !task.assignedTo.some(student => student._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task (professors only)
router.post('/', auth, authorize('professor'), async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    const { title, description, assignedTo, dueDate, maxScore, instructions, tags } = req.body;

    const taskData = {
      title,
      description,
      professor: req.user._id,
      dueDate: new Date(dueDate),
      maxScore: maxScore || 100
    };

    if (assignedTo && assignedTo.length > 0) {
      taskData.assignedTo = assignedTo;
    }

    if (instructions) taskData.instructions = instructions;
    if (tags && tags.length > 0) {
      taskData.tags = tags;
    }

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      taskData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }));
    }

    const task = new Task(taskData);
    await task.save();

    await task.populate('professor', 'name email');
    await task.populate('assignedTo', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Update task (professors only)
router.put('/:id', auth, authorize('professor'), upload.array('attachments', 5), handleUploadError, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to the professor
    if (task.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, assignedTo, dueDate, maxScore, instructions, tags, status } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = JSON.parse(assignedTo);
    if (dueDate) task.dueDate = new Date(dueDate);
    if (maxScore) task.maxScore = maxScore;
    if (instructions) task.instructions = instructions;
    if (tags) task.tags = JSON.parse(tags);
    if (status) task.status = status;

    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }));
      task.attachments.push(...newAttachments);
    }

    await task.save();
    await task.populate('professor', 'name email');
    await task.populate('assignedTo', 'name email');

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task (professors only)
router.delete('/:id', auth, authorize('professor'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to the professor
    if (task.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish task (professors only)
router.patch('/:id/publish', auth, authorize('professor'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = 'published';
    await task.save();

    res.json({
      message: 'Task published successfully',
      task
    });
  } catch (error) {
    console.error('Publish task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Close task (professors only)
router.patch('/:id/close', auth, authorize('professor'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = 'closed';
    await task.save();

    res.json({
      message: 'Task closed successfully',
      task
    });
  } catch (error) {
    console.error('Close task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
