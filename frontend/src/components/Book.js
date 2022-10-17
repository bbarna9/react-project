import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';

function Book(props) {
  const { book } = props;
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
        <Button>Kosárba</Button>
      </Card.Body>
    </Card>
  );
}

export default Book;
