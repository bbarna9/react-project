import React, { useContext, useEffect, useReducer } from 'react';
import { Store } from '../Store';
import { getError } from '../utils';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESSFUL':
      return { ...state, loading: false, orders: action.payload };
    case 'FETCH_FAILED':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESSFUL':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAILED':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function OrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESSFUL', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAILED', payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }

    // If there is a change in successDelete, this function will run, so we need to check.
    // If successDelete is true, the 'DELETE_RESET' will change it to false, so it will
    // activate the fetchData() function, and the list will reset.
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm('Biztos hogy törli?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Rendelés törölve');
        dispatch({ type: 'DELETE_SUCCESSFUL' });
      } catch (err) {
        dispatch({ type: 'DELETE_FAILED' });
        toast.error(getError(err));
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Rendelések</title>
      </Helmet>
      <h1>Rendelések</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>FELHASZNÁLÓ</th>
              <th>DÁTUM</th>
              <th>ÖSSZEG</th>
              <th>FIZETVE</th>
              <th>KISZÁLLÍTVA</th>
              <th>KEZELÉS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'TÖRÖLT'}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice}</td>
                <td>
                  {order.isPaid ? order.paidAt.substring(0, 10) : 'NINCS'}
                </td>
                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'NINCS'}
                </td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Részletek
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      deleteHandler(order);
                    }}
                  >
                    Törlés
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
