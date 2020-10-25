const request = require('supertest');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, populateDatabase } = require('./fixtures/db');

const baseURL = '/api/v1/users';

beforeEach(populateDatabase);

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
