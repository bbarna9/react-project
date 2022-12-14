import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import CheckoutSteps from '../components/CheckoutSteps';
import LoadingBox from '../components/LoadingBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Store } from '../Store';
import { getError } from '../utils.js';
import { toast } from 'react-toastify';
import Axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_ORDER':
      return { ...state, loading: true };
    case 'CREATE_ORDER_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_ORDER_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const roundTwoDigits = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = roundTwoDigits(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice =
    cart.itemsPrice > 10000 ? roundTwoDigits(0) : roundTwoDigits(990);
  cart.taxPrice = roundTwoDigits(0.27 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.taxPrice + cart.shippingPrice;

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_ORDER' });
      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'EMPTY_CART' });
      dispatch({ type: 'CREATE_ORDER_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_ORDER_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Rendel??s v??gleges??t??se</title>
      </Helmet>
      <h1 className="subHeader">Rendel??s v??gleges??t??se</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Sz??ll??t??s</Card.Title>
              <Card.Text>
                <strong>N??v:</strong> {cart.shippingAddress.fullName} <br />
                <strong>C??m: </strong> {cart.shippingAddress.address},{' '}
                {cart.shippingAddress.city}, {cart.shippingAddress.psotalCode},{' '}
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to="/shipping">Szerkeszt??s</Link>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Fizet??s</Card.Title>
              <Card.Text>
                <strong>M??d: </strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Szerkeszt??s</Link>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Term??kek</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/book/${item.key}`}>{item.title}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>{item.price} Ft</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Rendel??s ??sszegz??se</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Term??kek</Col>
                    <Col>{cart.itemsPrice.toFixed(0)} Ft</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Sz??ll??t??s</Col>
                    <Col>{cart.shippingPrice.toFixed(0)} Ft</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Ad??</Col>
                    <Col>{cart.taxPrice.toFixed(0)} Ft</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>??sszesen</strong>
                    </Col>
                    <Col>
                      <strong>{cart.totalPrice.toFixed(0)} Ft</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      className="grid-button"
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Megendel??s
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
