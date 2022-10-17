import { Link, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';

export default function LoginScreen() {
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';
  return (
    <Container className="small-container">
      <Helmet>
        <title>Bejelentkezés</title>
      </Helmet>
      <h1 className="my-3">Bejelentkezés</h1>
      <Form>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Jelszó</Form.Label>
          <Form.Control type="password" required />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Bejelentkezés</Button>
        </div>
        <div className="mb-3">
          Új felhasználó?{' '}
          <Link to={`/registry?redirect=${redirect}`}>Fiók létrehozása</Link>
        </div>
      </Form>
    </Container>
  );
}
