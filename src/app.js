const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const errorMiddlewares = require('./middleware/errors');
const api = require('./api');
// const userRouter = require('./api/users');
// const taskRouter = require('./api/tasks');

const app = express();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome ✋',
  });
});

app.use('/api/v1', api);
// app.use('/api/users', userRouter);
// app.use('/api/tasks', taskRouter);

app.use(errorMiddlewares.notFound);
app.use(errorMiddlewares.errorHandler);

module.exports = app;
