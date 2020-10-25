const express = require('express');

const authRouter = require('./auth');
const usersRouter = require('./users');
const tasksRouter = require('./tasks');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API v1.0 🚀',
  });
});

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/tasks', tasksRouter);

module.exports = router;
