const request = require('supertest');

const app = require('../src/app');
const Task = require('../src/models/task');
const {
  // userOneId,
  userOne,
  // userTwoId,
  userTwo,
  taskOne,
  // taskTwo,
  // taskThree,
  populateDatabase,
} = require('./fixtures/db');

const baseURL = '/api/v1/tasks';

const generateRandomString = (length = 5) => Math.random().toString(20).substr(2, length);

beforeEach(populateDatabase);

test('Should create task for user', async () => {
  const response = await request(app)
    .post(`${baseURL}/`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ description: generateRandomString(10) })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

test('Should get all tasks owned by the user who requested', async () => {
  const response = await request(app)
    .get(`${baseURL}/`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body).toHaveLength(2);
});

test('Should not delete a task owned by a different user', async () => {
  await request(app)
    .delete(`${baseURL}/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  expect(await Task.findById(taskOne._id)).not.toBeNull();
});
