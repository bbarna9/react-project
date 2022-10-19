import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function CheckoutSteps(props) {
  return (
    <Row className="checkout-steps">
      <Col className={props.step1 ? 'active' : ''}>Bejelentkezés</Col>
      <Col className={props.step2 ? 'active' : ''}>Szállítás</Col>
      <Col className={props.step3 ? 'active' : ''}>Fizetés</Col>
      <Col className={props.step4 ? 'active' : ''}>Rendelés</Col>
    </Row>
  );
}
