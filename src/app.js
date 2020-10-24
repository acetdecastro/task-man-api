const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const errorMiddlewares = require('./middleware/errors');
const userRouter = require('./api/user');
const taskRouter = require('./api/task');

const app = express();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(morgan('common'));

app.use('/api/users', userRouter);
app.use('/api/tasks', taskRouter);

app.use(errorMiddlewares.notFound);
app.use(errorMiddlewares.errorHandler);

module.exports = app;
