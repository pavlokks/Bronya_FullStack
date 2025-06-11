import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { url } from '../utils/Constants';
import swal from 'sweetalert';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [islogin, setIslogin] = useState(false);
  const [loading, setLoading] = useState(true); // стан завантаження
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedChat, setSelectedChat] = useState();
  const [searchResult, setSearchResult] = useState([]);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [loggedUser, setLoggedUser] = useState();
  const [filterData, setFilterData] = useState({
    address: '',
    placetype: '',
  });

  const navigate = useNavigate();

  const checkToken = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIslogin(false);
        setLoading(false);
        return;
      }
      const response = await fetch(`${url}/auth/verifyuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      const json = await response.json();
      if (json.success === true) {
        setIslogin(true);
        const userData = {
          ...json.data,
          username: json.data.username || `${json.data.firstName} ${json.data.lastName}`,
          phone: json.data.phone || '',
        };
        setUser(userData);
        setLoggedUser(userData);
        setUsername(json.data.username || `${json.data.firstName} ${json.data.lastName}`);
      } else {
        setIslogin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: 'Сервер недоступний!',
        icon: 'error',
        button: 'Ок!',
      });
      setIslogin(false);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, [navigate]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        username,
        setUsername,
        islogin,
        setIslogin,
        checkToken,
        latitude,
        setLatitude,
        longitude,
        setLongitude,
        searchResult,
        setSearchResult,
        selectedChat,
        setSelectedChat,
        notification,
        setNotification,
        chats,
        setChats,
        loggedUser,
        setLoggedUser,
        filterData,
        setFilterData,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
