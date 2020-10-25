const request = require('supertest');
const User = require('../src/models/user');
const { userOne } = require('./fixtures/db');
const app = require('../src/app');

const baseURL = '/api/v1/auth';

test('Should signup a new user', async () => {
  const response = await request(app)
    .post(`${baseURL}/signup`)
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
