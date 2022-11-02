import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESSFUL':
      return { ...state, loading: false };
    case 'FETCH_FAILED':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESSFUL':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAILED':
      return { ...state, loadingUpdate: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESSFUL':
      return { ...state, loadingUpload: false, errorUpload: '' };
    case 'UPLOAD_FAILED':
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
};

export default function EditScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const { id: bookId } = params;
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubCategory] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [page, setPage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/books/${bookId}`);
        setTitle(data.title);
        setKey(data.key);
        setImage(data.image);
        setAuthor(data.author);
        setCategory(data.category);
        setSubCategory(data.subcategory);
        setPrice(data.price);
        setPage(data.page);
        setStock(data.stock);
        setDescription(data.description);
        dispatch({ type: 'FETCH_SUCCESSFUL' });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAILED',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [bookId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/books/${bookId}`,
        {
          _id: bookId,
          title,
          key,
          author,
          image,
          category,
          subcategory,
          page,
          price,
          stock,
          description,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESSFUL',
      });
      toast.success('Termék frissítve');
      navigate('/admin/booklist');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAILED' });
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESSFUL' });
      toast.success('Kép sikeresen feltöltve');
      // This link is coming from the cloudinary
      setImage(data.secure_url);
    } catch (err) {
      dispatch({ type: 'FETCH_FAILED', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Könyv szerkesztése</title>
      </Helmet>
      <h1 className="subHeader">Köny szerkesztése</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3 tableText" controllId="title">
            <Form.Label>Cím</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="key">
            <Form.Label>ID</Form.Label>
            <Form.Control
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="image">
            <Form.Label>Kép</Form.Label>
            <Form.Control
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="imageFile">
            <Form.Label>File feltöltése</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="author">
            <Form.Label>Szerző</Form.Label>
            <Form.Control
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="category">
            <Form.Label>Kategória</Form.Label>
            <Form.Control
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="subcategory">
            <Form.Label>Alkategória</Form.Label>
            <Form.Control
              value={subcategory}
              onChange={(e) => setSubCategory(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="price">
            <Form.Label>Ár</Form.Label>
            <Form.Control
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="page">
            <Form.Label>Oldalszám</Form.Label>
            <Form.Control
              value={page}
              onChange={(e) => setPage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="description">
            <Form.Label>Leírás</Form.Label>
            <Form.Control
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 tableText" controllId="stock">
            <Form.Label>Darab</Form.Label>
            <Form.Control
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3 tableText">
            <Button type="submit" disabled={loadingUpdate}>
              Frissítés
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  );
}
