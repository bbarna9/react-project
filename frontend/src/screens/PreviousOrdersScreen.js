import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESSFUL':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAILED':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export default function PreviousOrdersScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/orders/mine`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESSFUL', payload: data });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAILED',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <div>
      <Helmet>
        <title>Korábbi rendelések</title>
      </Helmet>
      <h1 className="subHeader">Korábbi rendelések</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="theader">ID</th>
              <th className="theader">DÁTUM</th>
              <th className="theader">ÖSSZEG</th>
              <th className="theader">FIZETVE</th>
              <th className="theader">KISZÁLLÍTVA</th>
              <th className="theader">EGYÉB</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="tableText">{order._id}</td>
                <td className="tableText">
                  {order.createdAt.substring(0, 10)}
                </td>
                <td className="tableText">{order.totalPrice.toFixed(0)}</td>
                <td className="tableText">
                  {order.isPaid
                    ? order.paidAt.substring(0, 10)
                    : 'Nincs kifizetve'}
                </td>
                <td className="tableText">
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'Nincs kiszállítva'}
                </td>
                <td className="tableText">
                  <Button
                    type="button"
                    className="extra-btn"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Részletek
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
