import axios from 'axios';
import { useContext, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils.js';
import { Link } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, book: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function BookScreen() {
  const params = useParams();
  const { key } = params;

  const [{ loading, error, book }, dispatch] = useReducer(reducer, {
    book: [],
    loading: true,
    error: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/books/key/${key}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [key]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;
  const addToCartHandler = async () => {
    const alreadyExists = cart.cartItems.find((x) => x._id === book._id);
    const quantity = alreadyExists ? alreadyExists.quantity + 1 : 1;
    const { data } = await axios.get(`/api/books/${book._id}`);
    if (data.stock < quantity) {
      window.alert('Nincs több készleten');
      return;
    }

    ctxDispatch({
      type: 'ADD_TO_CART',
      payload: { ...book, quantity },
    });
  };
  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={4}>
          <img className="img-large" src={book.image} alt={book.title}></img>
        </Col>
        <Col md={5}>
          <ListGroup className="desc" variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{book.title}</title>
              </Helmet>
              <h1 className="desc-header">{book.title}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <p>{book.author}</p>
            </ListGroup.Item>
            <ListGroup.Item>{book.subcategory}</ListGroup.Item>
            <ListGroup.Item>
              <Rating rating={book.rating} reviews={book.reviews}></Rating>
            </ListGroup.Item>
            <ListGroup.Item>Ár: {book.price} Ft</ListGroup.Item>
            <ListGroup.Item>Oldalszám: {book.page}</ListGroup.Item>
            <ListGroup.Item>
              Leírás:
              <p>{book.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Ár:</Col>
                    <Col>{book.price} Ft</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Elérhetőség:</Col>
                    <Col>
                      {book.stock > 0 ? (
                        <Badge bg="success">Készleten</Badge>
                      ) : (
                        <Badge bg="danger">Nem elérhető</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {book.stock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button
                        onClick={addToCartHandler}
                        variant="primary"
                        className="grid-button"
                      >
                        Kosárba
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
export default BookScreen;
