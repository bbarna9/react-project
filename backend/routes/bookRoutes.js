import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Book from '../models/book.js';

const bookRouter = express.Router();

bookRouter.get('/', async (req, res) => {
  const books = await Book.find();
  res.send(books);
});

const PAGE_SIZE = 3;
bookRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const books = await Book.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countBooks = await Book.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      books,
      countBooks,
      page,
      pages: Math.ceil(countBooks / pageSize),
    });
  })
);

bookRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Book.find().distinct('category');
    res.send(categories);
  })
);

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
