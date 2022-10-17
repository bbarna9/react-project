import { Link } from 'react-router-dom';
import data from '../data';

function HomeScreen() {
  return (
    <div>
      <h1>Metro sorozat</h1>
      <div className="books">
        {data.books.map((book) => (
          <div className="book" key={book.key}>
            <Link to={`/book/${book.key}`}>
              <img src={book.image} alt={book.title} />
            </Link>
            <Link to={`/book/${book.key}`}>
              <p>{book.title}</p>
            </Link>
            <p>
              <strong>{book.price} Ft</strong>
            </p>
            <button>Kosárba</button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default HomeScreen;
