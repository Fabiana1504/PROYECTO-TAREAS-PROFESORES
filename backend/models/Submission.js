const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  content: {
    type: String,
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned'],
    default: 'submitted'
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [1000, 'Score cannot exceed 1000']
  },
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot be more than 2000 characters']
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  isLate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
submissionSchema.index({ task: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, status: 1 });
submissionSchema.index({ task: 1, status: 1 });

// Pre-save middleware to check if submission is late
submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const task = await mongoose.model('Task').findById(this.task);
    if (task && new Date() > task.dueDate) {
      this.isLate = true;
    }
  }
  next();
});

// Virtual for grade percentage
submissionSchema.virtual('gradePercentage').get(function() {
  if (!this.score) return null;
  const task = this.constructor.model('Task').findById(this.task);
  return task ? (this.score / task.maxScore) * 100 : null;
});

// Ensure virtual fields are serialized
submissionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Submission', submissionSchema);
