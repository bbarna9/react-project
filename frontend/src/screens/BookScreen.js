import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils.js';
import { Link } from 'react-router-dom';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_BOOK':
      return { ...state, book: action.payload };
    case 'REVIEW_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'REVIEW_SUCCESSFUL':
      return { ...state, loadingCreateReview: false };
    case 'REVIEW_FAILED':
      return { ...state, loadingCreateReview: false };
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
  let reviewsRef = useRef();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const params = useParams();
  const { key } = params;

  const [{ loading, error, book, loadingCreateReview }, dispatch] = useReducer(
    reducer,
    {
      book: [],
      loading: true,
      error: '',
    }
  );
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
  const { cart, userInfo } = state;
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

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Kérjük hagyjon értékelést és kommentet is');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/books/${book._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({
        type: 'REVIEW_SUCCESSFUL',
      });
      toast.success('Értékelés sikeresen hozzáadva');
      book.reviews.unshift(data.review);
      book.numReviews = data.numReviews;
      book.rating = data.rating;
      dispatch({ type: 'REFRESH_BOOK', payload: book });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAILED' });
    }
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
              <Rating
                rating={book.rating}
                numReviews={book.numReviews}
              ></Rating>
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
      <div className="my-3">
        <h2 ref={reviewsRef} className="subHeader">
          Értékelések
        </h2>
        <div className="mb-3">
          {book.reviews.length === 0 && (
            <MessageBox>Még nincs értékelés</MessageBox>
          )}
        </div>
        <ListGroup>
          {book.reviews.map((review) => (
            <ListGroup.Item key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} caption=" "></Rating>
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="my-3">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2 className="subHeader">Értékelje a könyvet</h2>
              <Form.Group className="mb-3" controllId="rating">
                <Form.Label className="tableText">Értékelés</Form.Label>
                <Form.Select
                  aria-label="Rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Választás</option>
                  <option value="1">1 - Nagyon nem tetszett</option>
                  <option value="2">2 - Nem tetszett</option>
                  <option value="3">3 - Semleges</option>
                  <option value="4">4 - Tetszett</option>
                  <option value="5">5 - Nagyon tetszett</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel
                controllId="floatingTextarea"
                label="Leírás"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Írjon értékelést"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </FloatingLabel>
              <div className="mb-3">
                <Button
                  disabled={loadingCreateReview}
                  className="review-btn"
                  type="submit"
                >
                  Küldés
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <MessageBox>
              Csak bejelentkezett felhasználók tudnak értékelést írni.
            </MessageBox>
          )}
        </div>
      </div>
    </div>
  );
}
export default BookScreen;
