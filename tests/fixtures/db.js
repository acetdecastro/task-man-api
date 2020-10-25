const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Sarah',
  email: 'sara@example.com',
  password: 'twilliosendgrid',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
  }],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'John',
  email: 'john@example.com',
  password: 'randomtest',
  tokens: [{
    token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
  }],
};

const taskOne = {
  _id: mongoose.Types.ObjectId(),
  description: 'First task',
  completed: false,
  ownerId: userOne._id,
};

const taskTwo = {
  _id: mongoose.Types.ObjectId(),
  description: 'Second task',
  completed: true,
  ownerId: userOne._id,
};

const taskThree = {
  _id: mongoose.Types.ObjectId(),
  description: 'Third task',
  completed: true,
  ownerId: userTwo._id,
};

const populateDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  populateDatabase,
};
