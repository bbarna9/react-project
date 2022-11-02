import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { Store } from '../Store';
import { useContext } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Book(props) {
  const { book } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const alreadyExists = cartItems.find((x) => x._id === book._id);
    const quantity = alreadyExists ? alreadyExists.quantity + 1 : 1;
    const { data } = await axios.get(`/api/books/${item._id}`);
    if (data.stock < quantity) {
      window.alert('Nincs több készleten');
      return;
    }
    ctxDispatch({
      type: 'ADD_TO_CART',
      payload: { ...item, quantity },
    });
  };

  return (
    <Card className="book">
      <Card.Body>
        <Row>
          <Col>
            <Link to={`/book/${book.key}`}>
              <img src={book.image} className="card-img-top" alt={book.title} />
            </Link>
          </Col>
          <Col className="bookText">
            <Link className="bookTitleLink" to={`/book/${book.key}`}>
              <Card.Title className="bookTitle">{book.title}</Card.Title>
            </Link>
            <Card.Text>{book.author}</Card.Text>
            <Rating rating={book.rating} numReviews={book.numReviews} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Card.Text className="price">{book.price} Ft</Card.Text>
            {book.stock === 0 ? (
              <Button variant="light" disabled className="btn-primary">
                Nincs készleten
              </Button>
            ) : (
              <Button
                onClick={() => addToCartHandler(book)}
                className="btn-primary"
              >
                Kosárba
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default Book;
