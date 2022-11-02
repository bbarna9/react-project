import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Book from '../components/Book';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        books: action.payload.books,
        page: action.payload.page,
        pages: action.payload.pages,
        countBooks: action.payload.countBooks,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

const prices = [
  {
    name: '1-2000',
    value: '1-2000',
  },
  {
    name: '2000-5000',
    value: '2000-5000',
  },
  {
    name: '5000-10000',
    value: '5000-10000',
  },
];

export const ratings = [
  {
    name: '4stars & up',
    rating: 4,
  },

  {
    name: '3stars & up',
    rating: 3,
  },

  {
    name: '2stars & up',
    rating: 2,
  },

  {
    name: '1stars & up',
    rating: 1,
  },
];

export default function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search); // /search?category=Shirts
  const category = sp.get('category') || 'all';
  // const subcategory = sp.get('subcategory') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = sp.get('page') || 1;

  const [{ loading, error, books, pages, countBooks }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          // `/api/books/search?page=${page}&query=${query}&category=${category}&subcategory=${subcategory}&price=${price}&rating=${rating}&order=${order}`
          `/api/books/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
    // }, [category, subcategory, error, order, page, price, query, rating]);
  }, [category, error, order, page, price, query, rating]);

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/books/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, [dispatch]);

  /*
  const [subCategories, setSubCategories] = useState([]);
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const { data } = await axios.get(`/api/books/subcategories`);
        setSubCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchSubCategories();
  }, [dispatch]); */

  const getFilterUrl = (filter) => {
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    // const filterSubCategory = filter.subcategory || subcategory;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    // return `/search?category=${filterCategory}&subcategory=${filterSubCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
    return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
  };
  return (
    <div className="search-screen">
      <Helmet>
        <title>Keresés</title>
      </Helmet>
      <Row>
        <Col md={3}>
          <div>
            <h3 className="list-header">Műfaj</h3>
            <ul className="list">
              <li>
                <Link
                  className={'all' === category ? 'text-bold' : 'searchText'}
                  to={getFilterUrl({ category: 'all' })}
                >
                  Bármi
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === category ? 'text-bold' : 'searchText'}
                    to={getFilterUrl({ category: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="list-header">Ár</h3>
            <ul className="list">
              <li>
                <Link
                  className={'all' === price ? 'text-bold' : 'searchText'}
                  to={getFilterUrl({ price: 'all' })}
                >
                  Bármi
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    to={getFilterUrl({ price: p.value })}
                    className={p.value === price ? 'text-bold' : 'searchText'}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="list-header">Átlag értékelések</h3>
            <ul className="list">
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    to={getFilterUrl({ rating: r.rating })}
                    className={
                      `${r.rating}` === `${rating}` ? 'text-bold' : 'searchText'
                    }
                  >
                    <Rating caption={' vagy jobb'} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={getFilterUrl({ rating: 'all' })}
                  className={rating === 'all' ? 'text-bold' : 'searchText'}
                >
                  <Rating caption={' vagy jobb'} rating={0}></Rating>
                </Link>
              </li>
            </ul>
          </div>
        </Col>
        <Col md={9}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={6}>
                  <div className="sort-text">
                    {countBooks === 0 ? 'Nincs' : countBooks} Eredmények
                    {query !== 'all' && ' : ' + query}
                    {category !== 'all' && ' : ' + category}
                    {price !== 'all' && ' : Ár ' + price}
                    {rating !== 'all' &&
                      ' : Értékelás ' + rating + ' vagy több'}
                    {query !== 'all' ||
                    category !== 'all' ||
                    rating !== 'all' ||
                    price !== 'all' ? (
                      <Button
                        variant="light"
                        onClick={() => navigate('/search')}
                        className="sort-btn"
                      >
                        <i>Szűrők törlése</i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
                <Col className="text-end">
                  Rendezés:{' '}
                  <select
                    className="select-bar"
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value }));
                    }}
                  >
                    <option value="newest">Legújabbak</option>
                    <option value="lowest">Ár szerint növekvő</option>
                    <option value="highest">Ár szerint csökkenő</option>
                    <option value="toprated">Legjobban értékelt</option>
                  </select>
                </Col>
              </Row>
              {books.length === 0 && (
                <MessageBox>Nincs elérhető könyv</MessageBox>
              )}

              <Row>
                {books.map((book) => (
                  <Col sm={6} lg={4} className="mb-3" key={book._id}>
                    <Book book={book}></Book>
                  </Col>
                ))}
              </Row>

              <div>
                {[...Array(pages).keys()].map((x) => (
                  <Link
                    key={x + 1}
                    className="mx-1"
                    to={getFilterUrl({ page: x + 1 })}
                  >
                    <Button
                      className={
                        Number(page) === x + 1
                          ? 'text-bold page-btn'
                          : 'page-btn'
                      }
                      variant="dark"
                    >
                      {x + 1}
                    </Button>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}

/*

Alkategória kereső

<div>
            <h3>Sorozat</h3>
            <ul>
              <li>
                <Link
                  className={'all' === subcategory ? 'text-bold' : ''}
                  to={getFilterUrl({ subcategory: 'all' })}
                >
                  Bármi
                </Link>
              </li>
              {subCategories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === subcategory ? 'text-bold' : ''}
                    to={getFilterUrl({ subcategory: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

*/
