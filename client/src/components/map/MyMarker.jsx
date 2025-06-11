import React from 'react';
import { Link } from 'react-router-dom';

const MyMarker = ({
  text,
  tooltip,
  $hover,
  price,
  placetype,
  isbooked,
  photos,
  isOpen,
  onToggle,
  onMapClick,
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onToggle) onToggle();
  };

  return (
    <div className={$hover || isOpen ? 'circles hover' : 'circles'} onClick={handleClick}>
      <span className="circlesText" title={tooltip}></span>
      {isOpen && (
        <div className="mminfoTab" onClick={(e) => e.stopPropagation()}>
          <div className="mmcard">
            <div className="mmcard-header">
              <h3 className="mmcard-title">{tooltip}</h3>
            </div>
            <div className="mmcard-body">
              {photos && photos.length > 0 ? (
                <img src={photos[0]} alt={tooltip} className="mmcard-img" />
              ) : (
                <div className="mmcard .mmuno-photo">Немає фото</div>
              )}
              <p className="mmcard-text">Тип: {placetype}</p>
              <p className="mmcard-text">
                Ціна: ₴{placetype === 'Hotel' ? price : price * 30}{' '}
                {placetype === 'Hotel' ? 'за ніч' : 'за місяць'}
              </p>
              <div className="mmcard-actions">
                {isbooked ? (
                  <button disabled className="mmbtn-primary">
                    Заброньовано!
                  </button>
                ) : (
                  <Link to={`/detail/${text}`}>
                    <button className="mmbtn-primary">Деталі</button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMarker;
