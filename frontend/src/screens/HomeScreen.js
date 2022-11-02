import { useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
// import logger from 'use-reducer-logger';
// import data from '../data';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
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
        <title>Readers-Heaven</title>
      </Helmet>
      <h1 className="subHeader">Metro sorozat</h1>
      <div className="firstDiv">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <div>
              <Book book={books.find((x) => x.key === 'metro-2033')}></Book>
            </div>
            <div>
              <Book book={books.find((x) => x.key === 'metro-2034')}></Book>
            </div>
            <div>
              <Book book={books.find((x) => x.key === 'metro-2035')}></Book>
            </div>
            <div>
              <Book book={books.find((x) => x.key === 'a-feny-fele')}></Book>
            </div>
            <div>
              <Book book={books.find((x) => x.key === 'az-eg-gyokerei')}></Book>
            </div>
            <div className="more">
              <Link to={`/search?query=metro`} className="moreText">
                <Button className="more-btn">Több megtekintése</Button>
              </Link>
            </div>
          </>
        )}
      </div>
      <h1 className="subHeader">Harry Potter sorozat</h1>
      <div className="secondDiv">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <div>
              <Book
                book={books.find((x) => x.key === 'harry-potter-bolcsek-kove')}
              ></Book>
            </div>
            <div>
              <Book
                book={books.find((x) => x.key === 'harry-potter-titkok')}
              ></Book>
            </div>
            <div>
              <Book
                book={books.find((x) => x.key === 'harry-potter-azkaban')}
              ></Book>
            </div>
            <div>
              <Book
                book={books.find((x) => x.key === 'harry-potter-tuz-serlege')}
              ></Book>
            </div>
            <div className="more">
              <Link to={`/search?query=harry potter`} className="moreText">
                <Button className="more-btn">Több megtekintése</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
