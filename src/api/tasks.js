const { Router } = require('express');
const mongoose = require('mongoose');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = Router();

// GET /api/tasks?completed=true
// GET /api/tasks?limit=10&skip=0
// GET /api/tasks?sortBy=createdAt:desc
router.get('/', auth, async (req, res, next) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit, 10),
        skip: parseInt(req.query.skip, 10),
        sort,
      },
    }).execPopulate();

    res.json(req.user.tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      _id: id,
      ownerId: req.user._id,
    });

    if (task === null) {
      const error = new Error('Error: No task found with the given ID.');
      res.status(404);
      return next(error);
    }

    res.json(task);
  } catch (error) {
    if (mongoose.isValidObjectId(id) === false) {
      const invalidIdFormatError = new Error('Error: Invalid ID format.');
      res.status(400);
      return next(invalidIdFormatError);
    }

    next(error);
  }

  return null;
});

router.post('/', auth, async (req, res, next) => {
  try {
    const task = new Task({
      ...req.body,
      ownerId: req.user._id,
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400);
    }

    next(error);
  }
});

router.patch('/:id', auth, async (req, res, next) => {
  const { id } = req.params;
  const updateBody = req.body;
  const updateFields = Object.keys(updateBody);
  const allowedUpdates = ['description', 'completed'];

  const isValidOperation = updateFields.every((updateField) => allowedUpdates.includes(updateField));

  if (isValidOperation === false) {
    const error = new Error('Update Error: Invalid format/update.');
    res.status(400);
    return next(error);
  }

  try {
    const task = await Task.findOne({
      _id: id,
      ownerId: req.user._id,
    });

    if (task === null) {
      const error = new Error('Error: No task found with the given ID.');
      res.status(404);
      return next(error);
    }

    updateFields.forEach((field) => {
      task[field] = updateBody[field];
    });

    await task.save();

    res.json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400);
    }

    if (mongoose.isValidObjectId(id) === false) {
      const invalidIdFormatError = new Error('Error: Invalid ID format.');
      res.status(400);
      return next(invalidIdFormatError);
    }

    next(error);
  }

  return null;
});

router.delete('/:id', auth, async (req, res, next) => {
  const { id } = req.params;
  try {
    const task = await Task.findOneAndDelete({
      _id: id,
      ownerId: req.user._id,
    });

    if (task === null) {
      const error = new Error('Error: No task found with the given ID.');
      res.status(404);
      return next(error);
    }

    res.send(task);
  } catch (error) {
    if (mongoose.isValidObjectId(id) === false) {
      const invalidIdFormatError = new Error('Error: Invalid ID format.');
      res.status(400);
      return next(invalidIdFormatError);
    }

    next(error);
  }

  return null;
});

module.exports = router;
