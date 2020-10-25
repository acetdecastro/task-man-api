const { Router } = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendCancelAccountEmail } = require('../emails/account');
// const mongoose = require('mongoose');

const router = Router();
const upload = multer({
  // dest: 'uploads/avatar',
  limits: {
    fileSize: 1000000,
  },

  fileFilter(req, file, cb) {
    // if (file.originalname.endsWith('.pdf') === false) {
    //   return cb(new Error('File must be a PDF.'));
    // }

    // if (!file.originalname.match(/\.(doc|docx)$/)) {
    //   return cb(new Error('File must be Word document.'));
    // }

    const extensions = ['.jpg', '.jpeg', '.png'];

    if (!extensions.some((ext) => file.originalname.endsWith(ext))) {
      return cb(new Error('File must be an image.'));
    }

    return cb(undefined, true);
  },
});

router.post('/upload/avatar', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    // <img src="data:image/jpg;base64,<insert binary path>" />

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  } catch (error) {
    next(error);
  }
});

router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

router.get('/:id/avatar', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user === null || user.avatar === undefined) {
      const error = new Error('Error: No user found with the given ID.');
      res.status(404);
      return next(error);
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404);
    next(error);
  }

  return null;
});

router.patch('/updateProfile', auth, async (req, res, next) => {
  try {
    const updateBody = req.body;
    const updateFields = Object.keys(updateBody);
    const allowedUpdates = ['name', 'email', 'password'];

    const isValidOperation = updateFields.every((updateField) => allowedUpdates.includes(updateField));

    if (isValidOperation === false) {
      const error = new Error('Update Error: Invalid format/update.');
      res.status(400);
      return next(error);
    }

    updateFields.forEach((field) => {
      req.user[field] = updateBody[field];
    });

    await req.user.save();

    res.json(req.user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400);
    }

    next(error);
  }

  return null;
});

router.delete('/deactivate', auth, async (req, res, next) => {
  try {
    await req.user.remove();
    sendCancelAccountEmail(req.user.email, req.user.name);
    res.send();
  } catch (error) {
    next(error);
  }
});

router.delete('/delete/avatar', auth, async (req, res, next) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    next(error);
  }
});

/* Sample routes below */

/*
router.get('/', auth, async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (user === null) {
      const error = new Error('Error: No user found with the given ID.');
      res.status(404);
      return next(error);
    }

    res.json(user);
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

router.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const updateBody = req.body;
  const updateFields = Object.keys(updateBody);
  const allowedUpdates = ['name', 'email', 'password'];

  const isValidOperation = updateFields.every((updateField) => allowedUpdates.includes(updateField));

  if (isValidOperation === false) {
    const error = new Error('Update Error: Invalid format/update.');
    res.status(400);
    return next(error);
  }

  try {
    const user = await User.findById(id);

    if (user === null) {
      const error = new Error('Error: No user found with the given ID.');
      res.status(404);
      return next(error);
    }

    updateFields.forEach((field) => {
      user[field] = updateBody[field];
    });

    await user.save();

    res.json(user);
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
    const user = await User.findByIdAndDelete(id);

    if (user === null) {
      const error = new Error('Error: No user found with the given ID.');
      res.status(404);
      return next(error);
    }

    res.json(user);
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
*/

module.exports = router;
