import express from 'express';
import Book from '../models/book.js';

const bookRouter = express.Router();

bookRouter.get('/', async (req, res) => {
  const books = await Book.find();
  res.send(books);
});

bookRouter.get('/key/:key', async (req, res) => {
  const book = await Book.findOne({ key: req.params.key });
  if (book) {
    res.send(book);
  } else {
    res.status(404).send({ message: 'Nincs ilyen könyv' });
  }
});

bookRouter.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    res.send(book);
  } else {
    res.status(404).send({ message: 'Nincs ilyen könyv' });
  }
});

export default bookRouter;
