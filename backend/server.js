import express from 'express';
import data from './data.js';

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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
