import { useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
// import logger from 'use-reducer-logger';
// import data from '../data';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Book from '../components/Book';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, books: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  //const [{ loading, error, books }, dispatch] = useReducer(logger(reducer), {
  const [{ loading, error, books }, dispatch] = useReducer(reducer, {
    books: [],
    loading: true,
    error: '',
  });
  // const [books, setBooks] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/books');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }

      // setBooks(result.data);
    };
    fetchData();
  }, []);
  return (
    <div>
      <Helmet>
        <title>Bookshop</title>
      </Helmet>
      <h1>Metro sorozat</h1>
      <div className="books">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {books.map((book) => (
              <Col key={book.key} sm={6} md={4} lg={3} className="mb-3">
                <Book book={book}></Book>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
