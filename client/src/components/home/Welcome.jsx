import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/welcome.css';
import cities from '../../assets/data/cities.json';

const Welcome = () => {
  return (
    <section className="welcome">
      <div className="welcome-container container">
        <div className="welcome-left">
          <div className="welcome-left-top">
            <h1>
              Бронюйте та розміщайте
              <br />
              приміщення на
              <br />
              BRONYA.ua
            </h1>
            <p>Чат, мапа, бронювання та найкращі приміщення!</p>
          </div>
          <div className="welcome-btns">
            <Link to="/room">
              <button className="btn btn-primary">Забронювати кімнату</button>
            </Link>
            <Link to="/profile/places">
              <button className="btn btn-secondary">Розмістити оголошення</button>
            </Link>
          </div>
        </div>
        <div className="welcome-cities">
          {cities.map((city, index) => (
            <Link to="/map" key={city.id}>
              <div className={`city-card city-${index}`}>
                <span>{city.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Welcome;
