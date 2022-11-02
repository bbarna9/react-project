import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESSFUL':
      return {
        ...state,
        books: action.payload.books,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESSFUL':
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAILED':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESSFUL':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAILED':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function BookListScreen() {
  const [
    {
      loading,
      error,
      books,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/books/admin?page=${page}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESSFUL', payload: data });
      } catch (err) {}
    };
    fetchData();
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete]);

  const createHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        '/api/books',
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success('Termék hozzáadva');
      dispatch({ type: 'CREATE_SUCCESSFUL' });
      navigate(`/admin/book/${data.book._id}`);
    } catch (err) {
      toast.error(getError(err));
      dispatch({
        type: 'CREATE_FAILED',
      });
    }
  };

  const deleteHandler = async (book) => {
    if (window.confirm('Biztos hogy törli?')) {
      try {
        await axios.delete(`/api/books/${book._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'DELETE_SUCCESSFUL' });
        toast.success('Termék törölve');
      } catch (err) {
        dispatch({ type: 'DELETE_FAILED' });
        toast.error(getError(err));
      }
    }
  };

  return (
    <div>
      <Row>
        <Col>
          <h1 className="subHeader">Termékek</h1>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" className="add-btn" onClick={createHandler}>
              Termék hozzáadása
            </Button>
          </div>
        </Col>
      </Row>

      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox cariant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th className="theader">ID</th>
                <th className="theader">CÍM</th>
                <th className="theader">SZERZŐ</th>
                <th className="theader">KATEGÓRIA</th>
                <th className="theader">ALKATEGÓRIA</th>
                <th className="theader">ÁR</th>
                <th className="theader">KEZELÉS</th>
              </tr>
            </thead>
            <tbody className="tableText">
              {books.map((book) => (
                <tr key={book._id}>
                  <td className="tableText">{book._id}</td>
                  <td className="tableText">{book.title}</td>
                  <td className="tableText">{book.author}</td>
                  <td className="tableText">{book.category}</td>
                  <td className="tableText">{book.subcategory}</td>
                  <td className="tableText">{book.price}</td>
                  <td>
                    <Button
                      className="extra-btn"
                      type="button"
                      variant="light"
                      onClick={() => navigate(`/admin/book/${book._id}`)}
                    >
                      Szerkesztés
                    </Button>
                    &nbsp;
                    <Button
                      className="extra-btn"
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(book)}
                    >
                      Törlés
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={
                  x + 1 === Number(page)
                    ? 'page-btn text-bold tableText'
                    : 'page-btn tableText'
                }
                key={x + 1}
                to={`/admin/booklist?page=${x + 1}`}
              >
                <Button
                  className={
                    Number(page) === x + 1 ? 'text-bold page-btn' : 'page-btn'
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
    </div>
  );
}
