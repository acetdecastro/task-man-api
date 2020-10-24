const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const User = require('../src/models/user');

const baseURL = '/api/users';

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Sarah',
  email: 'sara@example.com',
  password: '56what!!',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
  }],
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should signup a new user', async () => {
  const response = await request(app)
    .post(`${baseURL}/`)
    .send({
      name: 'Juan',
      email: 'juan@example.com',
      password: 'MyPass777!',
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Juan',
      email: 'juan@example.com',
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe('MyPass777!');
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post(`${baseURL}/login`)
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Assert that the created token from logging in matches a token in the database
  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non-existent user', async () => {
  await request(app)
    .post(`${baseURL}/login`)
    .send({
      email: 'nonexistentuser@email.com',
      password: 'nonexistentuser',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get(`${baseURL}/profile`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get(`${baseURL}/profile`)
    .send()
    .expect(401);
});

test('Should deactivate account for user', async () => {
  await request(app)
    .delete(`${baseURL}/deactivate`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that the deactivated user does not exist in the users collection
  const user = await User.findById(userOne._id);
  expect(user).toBeNull();
});

test('Should not deactivate account for unauthenticated user', async () => {
  await request(app)
    .delete(`${baseURL}/deactivate`)
    .send()
    .expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post(`${baseURL}/upload/avatar`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  const fields = {
    name: 'New Name',
    email: 'newemail@email.com',
    password: 'newpw12345',
  };

  const response = await request(app)
    .patch(`${baseURL}/updateProfile`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(fields)
    .expect(200);

  const user = await User.findById(response.body._id);

  expect(fields).toMatchObject({
    name: user.name,
    email: user.email,
  });

  expect(true).toBe(await bcrypt.compare(fields.password, user.password));
});

test('Should not update invalid user fields', async () => {
  const fields = {
    name: '',
    email: 'newinvalidemail',
    password: 'password123',
    location: 'Quebec',
  };

  await request(app)
    .patch(`${baseURL}/updateProfile`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(fields)
    .expect(400);
});
