import React, { useContext, useEffect, useReducer } from 'react';
import { Store } from '../Store';
import { getError } from '../utils';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESSFUL':
      return {
        ...state,
        loading: false,
        orders: action.payload,
        page: action.payload.page,
        pages: action.payload.pages,
      };
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
  const [
    { loading, error, orders, pages, loadingDelete, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;
  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        //const { data } = await axios.get(`/api/orders/admin?page=${page}`, {
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
  }, [page, userInfo, successDelete]);

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
      <h1 className="subHeader">Rendelések</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th className="theader">ID</th>
                <th className="theader">FELHASZNÁLÓ</th>
                <th className="theader">DÁTUM</th>
                <th className="theader">ÖSSZEG</th>
                <th className="theader">FIZETVE</th>
                <th className="theader">KISZÁLLÍTVA</th>
                <th className="theader">KEZELÉS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="tableText">{order._id}</td>
                  <td className="tableText">
                    {order.user ? order.user.name : 'TÖRÖLT'}
                  </td>
                  <td className="tableText">
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="tableText">{order.totalPrice}</td>
                  <td className="tableText">
                    {order.isPaid ? order.paidAt.substring(0, 10) : 'NINCS'}
                  </td>
                  <td className="tableText">
                    {order.isDelivered
                      ? order.deliveredAt.substring(0, 10)
                      : 'NINCS'}
                  </td>
                  <td>
                    <Button
                      className="extra-btn"
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
                      className="extra-btn"
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
        </>
      )}
    </div>
  );
}

/*

          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={
                  x + 1 === Number(page)
                    ? 'page-btn text-bold tableText'
                    : 'page-btn tableText'
                }
                key={x + 1}
                to={`/admin/orderlist?page=${x + 1}`}
              >
                <Button
                  className={
                    Number(page) === x + 1 ? 'text-bold page-btn' : 'page-btn'
                  }
                  variant="dark"
                >
                  {x + 1}
                </Button>
              </Link>
            ))}
          </div> */
