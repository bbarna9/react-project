import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Book from '../models/bookModel.js';
import { isAuth, isAdmin } from '../utils.js';

const bookRouter = express.Router();

bookRouter.get('/', async (req, res) => {
  const books = await Book.find();
  res.send(books);
});

bookRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newBook = new Book({
      title: '',
      key: '',
      image: '',
      price: 0,
      category: '',
      subcategory: '',
      author: '',
      stock: 0,
      rating: 0,
      reviews: 0,
      description: '',
    });
    const book = await newBook.save();
    res.send({ message: 'Termék hozzáadva', book });
  })
);

bookRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    if (book) {
      book.title = req.body.title;
      book.key = req.body.key;
      book.image = req.body.image;
      book.author = req.body.author;
      book.category = req.body.category;
      book.subcategory = req.body.subcategory;
      book.description = req.body.description;
      book.price = req.body.price;
      book.stock = req.body.stock;
      await book.save();
      res.send({ message: 'Termék frissítve' });
    } else {
      res.status(404).send({ message: 'Nincs ilyen termék' });
    }
  })
);

bookRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (book) {
      await book.remove();
      res.send({ message: 'Termék törölve' });
    } else {
      res.status(404).send({ message: 'Nincs ilyen könyv' });
    }
  })
);

const PAGE_SIZE = 5;

bookRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const books = await Book.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countBooks = await Book.countDocuments();
    res.send({
      books,
      countBooks,
      page,
      pages: Math.ceil(countBooks / pageSize),
    });
  })
);

bookRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const subcategory = query.subcategory || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            title: {
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

/*

bookRouter.get(
  '/subcategories',
  expressAsyncHandler(async (req, res) => {
    const subcategories = await Book.find().distinct('subcategory');
    res.send(subcategories);
  })
);

*/

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
