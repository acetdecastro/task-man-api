const mongoose = require('mongoose');

const { Schema } = mongoose;

const taskSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  ownerId: {
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
