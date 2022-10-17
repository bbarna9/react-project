import express from 'express';
import Book from '../models/book.js';
import data from '../data.js';
import User from '../models/user.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  await Book.remove({});
  const createdBooks = await Book.insertMany(data.books);
  await User.remove({});
  const createdUsers = await User.insertMany(data.users);
  res.send({ createdBooks, createdUsers });
});
export default seedRouter;
