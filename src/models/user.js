const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,

    validate(value) {
      if (validator.isEmail(value) === false) {
        throw new Error('Email is invalid.');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,

    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password can\'t contain "password".');
      }
    },
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
  avatar: {
    type: Buffer,
  },
}, {
  timestamps: true,
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function deleteTasksFromRemovedUser(next) {
  const user = this;
  await Task.deleteMany({ ownerId: user._id });
  next();
});

userSchema.pre('save', async function hashPassword(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'ownerId',
});

userSchema.methods.toJSON = function getPublicProfile() {
  const user = this;
  const rawUserObject = user.toObject();

  delete rawUserObject.password;
  delete rawUserObject.tokens;
  delete rawUserObject.avatar;

  return rawUserObject;
};

userSchema.methods.generateAuthToken = async function generateAuthToken() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '7 day' });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // eslint-disable-next-line no-use-before-define
  const user = await User.findOne({ email });

  if (user === null) {
    throw new Error('Unable to login.');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch === false) {
    throw new Error('Unable to login.');
  }

  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
