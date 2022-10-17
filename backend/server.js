import express from 'express';
import data from './data.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Fetching data from the .env file
dotenv.config();

// Making connection to the database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();

app.get('/api/books', (req, res) => {
  res.send(data.books);
});
app.get('/api/books/key/:key', (req, res) => {
  const book = data.books.find((x) => x.key === req.params.key);
  if (book) {
    res.send(book);
  } else {
    res.status(404).send({ message: 'Nincs ilyen könyv' });
  }
});

app.get('/api/books/:id', (req, res) => {
  const book = data.books.find((x) => x._id === req.params.id);
  if (book) {
    res.send(book);
  } else {
    res.status(404).send({ message: 'Nincs ilyen könyv' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
