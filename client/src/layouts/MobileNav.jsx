import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, MessageSquare, Menu, Hotel, Bed } from 'lucide-react';
import '../assets/styles/navbar.css';

const MobileNav = () => {
  return (
    <div className="mobile-nav">
      <div className="mobile-nav-tabs">
        <NavLink to="/" className="nav-tab">
          <Home className="tab-icon" />
          <span className="tab-name">Головна</span>
        </NavLink>
        <NavLink to="/room" className="nav-tab">
          <Bed className="tab-icon" />
          <span className="tab-name">Кімнати</span>
        </NavLink>
        <NavLink to="/flat" className="nav-tab">
          <Hotel className="tab-icon" />
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
    </div>
  );
};

export default MobileNav;
