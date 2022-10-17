import { useParams } from 'react-router-dom';

function BookScreen() {
  const params = useParams();
  const { key } = params;
  return (
    <div>
      <h1>{key}</h1>
    </div>
  );
}
export default BookScreen;
