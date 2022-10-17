import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { Store } from '../Store';
import { useContext } from 'react';

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
    <Card>
      <Link to={`/book/${book.key}`}>
        <img src={book.image} className="card-img-top" alt={book.title} />
      </Link>
      <Card.Body>
        <Link to={`/book/${book.key}`}>
          <Card.Title>{book.title}</Card.Title>
        </Link>
        <Rating rating={book.rating} reviews={book.reviews} />
        <Card.Text>{book.price} Ft</Card.Text>
        {book.stock === 0 ? (
          <Button variant="light" disabled>
            Nincs készleten
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(book)}>Kosárba</Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default Book;
