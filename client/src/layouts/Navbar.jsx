import React, { useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import '../assets/styles/navbar.css';
import { UserContext } from '../context/UserContext.jsx';
import { LogIn, LogOut, Home, Map, MessageSquare, Menu, Hotel, Bed, Building } from 'lucide-react';
import Avatar from '@mui/material/Avatar';

const Navbar = () => {
  const navigate = useNavigate();
  const { islogin, setIslogin, username, checkToken } = useContext(UserContext);

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
    setIslogin(false);
  };

  React.useEffect(() => {
    checkToken();
  }, [islogin]);

  return (
    <nav className="navbar container" style={{ fontFamily: 'Victor Mono, monospace' }}>
      <div className="nav-left">
        <NavLink to="/" className="nav-img">
          <img src={require('../assets/media/images/BRONYA-logo.png')} alt="Логотип BRONYA" />
          <span style={{ fontSize: '18px', textAlign: 'left', display: 'block' }}>
            BRONYA
            <br />
            <strong>Бронювання приміщень</strong>
          </span>
        </NavLink>
      </div>
      <div className="nav-right">
        <div className="nav-tabs">
          <NavLink to="/" className="nav-tab">
            <Home className="tab-icon" />
            <span className="tab-name">Головна</span>
          </NavLink>
          <NavLink to="/room" className="nav-tab">
            <Bed className="tab-icon" />
            <span className="tab-name">Кімнати</span>
          </NavLink>
          <NavLink to="/flat" className="nav-tab">
            <Building className="tab-icon" />
            <span className="tab-name">Квартири</span>
          </NavLink>
          <NavLink to="/hotel" className="nav-tab">
            <Hotel className="tab-icon" />
            <span className="tab-name">Готелі</span>
          </NavLink>
          <NavLink to="/map" className="nav-tab">
            <Map className="tab-icon" />
            <span className="tab-name">Мапа</span>
          </NavLink>
          <NavLink to="/chats" className="nav-tab">
            <MessageSquare className="tab-icon" />
            <span className="tab-name">Чат</span>
          </NavLink>
          <NavLink to="/profile" className="nav-tab">
            <Menu className="tab-icon" />
            <span className="tab-name">Меню</span>
          </NavLink>
        </div>
        {islogin ? (
          <div className="nav-btns">
            <span className="welcome-username">{username}</span>
            <NavLink to="/profile">
              <Avatar className="profile-avatar" title={username}>
                {username[0]}
              </Avatar>
            </NavLink>
            <button className="btn logout-btn" onClick={logout}>
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="nav-btns">
            <NavLink to="/login">
              <button className="btn btn-primary login-btn">
                <LogIn size={20} /> Увійти
              </button>
            </NavLink>
            <NavLink to="/signup">
              <button className="btn btn-primary signup-btn">
                <LogIn size={20} /> Зареєструватись
              </button>
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
