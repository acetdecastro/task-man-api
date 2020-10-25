const { Router } = require('express');

const User = require('../../models/user');
const auth = require('../../middleware/auth');
const { sendWelcomeEmail } = require('../../emails/account');

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    // 11000 - Mongo Error - duplicate key (email)
    if (error.name === 'ValidationError') {
      res.status(400);
    }

    if (error.code === 11000) {
      next(new Error('Email is already taken.'));
    }

    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({
      user,
      token,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
});

router.get('/logout', auth, async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);

    await req.user.save();

    res.send();
  } catch (error) {
    next(error);
  }
});

router.get('/logoutAll', auth, async (req, res, next) => {
  try {
    req.user.tokens = [];

    await req.user.save();

    res.send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
