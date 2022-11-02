import React, { useContext, useEffect, useReducer } from 'react';
import { Store } from '../Store.js';
import { getError } from '../utils.js';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import Button from 'react-bootstrap/Button';
import MessageBox from '../components/MessageBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESSFUL':
      return { ...state, loading: false, users: action.payload };
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

export default function UserListScreen() {
  const navigate = useNavigate();
  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users`, {
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
  }, [userInfo, successDelete]);

  const deleteHandler = async (user) => {
    if (window.confirm('Biztosan törli?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'DELETE_SUCCESSFUL' });
        toast.success('Felhasználó törölve');
      } catch (err) {
        dispatch({ type: 'DELETE_FAILED' });
        toast.error(getError(err));
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Felhasználók</title>
      </Helmet>
      <h1 className="subHeader">Felhasználók</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="theader">ID</th>
              <th className="theader">NÉV</th>
              <th className="theader">EMAIL</th>
              <th className="theader">ADMIN</th>
              <th className="theader">KEZELÉS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="tableText">{user._id}</td>
                <td className="tableText">{user.name}</td>
                <td className="tableText">{user.email}</td>
                <td className="tableText">{user.admin ? 'IGEN' : 'NEM'}</td>
                <td>
                  <Button
                    className="extra-btn"
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/admin/user/${user._id}`)}
                  >
                    Szerkesztés
                  </Button>
                  &nbsp;
                  <Button
                    className="extra-btn"
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(user)}
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
