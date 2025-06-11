import React, { useState, useEffect, useRef } from 'react';
import '../../assets/styles/map.css';
import { useNavigate, useLocation } from 'react-router-dom';
import swal from 'sweetalert';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import MyMarker from './MyMarker';
import { url } from '../../utils/Constants';

const distanceToMouse = (pt, mp) => {
  if (pt && mp) {
    return Math.sqrt((pt.x - mp.x) * (pt.x - mp.x) + (pt.y - mp.y) * (pt.y - mp.y));
  }
};

export default function Map() {
  const [points, setPoints] = useState([]);
  const [openMarkerId, setOpenMarkerId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [lastClickTime, setLastClickTime] = useState(0);
  const mapRef = useRef(null);

  const query = new URLSearchParams(location.search);
  const placeId = query.get('placeId');
  const initialLat = parseFloat(query.get('lat')) || 49.038;
  const initialLng = parseFloat(query.get('lng')) || 31.451;

  useEffect(() => {
    const getPoints = async () => {
      try {
        const response = await axios.get(`${url}/places/allplaces`);
        setPoints(response.data);
      } catch (error) {
        console.error('Places loading error:', error);
      }
    };
    getPoints();
  }, []);

  const handleMapClick = (event) => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      const { lat, lng } = event;
      setOpenMarkerId(null);
      swal({
        text: 'Бажаєте додати/закріпити цю локацію?',
        icon: 'success',
        buttons: {
          cancel: 'Скасувати',
          confirm: 'Так',
        },
      }).then((value) => {
        if (value) {
          console.log('Chosen coordinates:', { lat, lng });
          swal({
            title: 'Локацію додано!',
            text: `Широта=${lat} Довгота=${lng}`,
            icon: 'success',
            button: 'Ок!',
          });
          navigate(
            placeId
              ? `/profile/places/${placeId}?lat=${lat}&lng=${lng}`
              : `/profile/places/new?lat=${lat}&lng=${lng}`,
          );
        } else {
          navigate(
            `/map?placeId=${encodeURIComponent(placeId || '')}&lat=${initialLat}&lng=${initialLng}`,
          );
        }
      });
    }
    setLastClickTime(currentTime);
  };

  const handleOutsideClick = () => {
    setOpenMarkerId(null);
  };

  const toggleMarker = (id) => {
    setOpenMarkerId((prev) => (prev === id ? null : id));
  };

  const validPoints = points.filter(({ latitude, longitude }) => {
    return (
      latitude != null &&
      longitude != null &&
      latitude !== '' &&
      longitude !== '' &&
      !isNaN(parseFloat(latitude)) &&
      !isNaN(parseFloat(longitude))
    );
  });

  return (
    <div
      style={{ width: '100%', height: '79vh', overflow: 'hidden' }}
      onClick={handleOutsideClick}
      ref={mapRef}
    >
// Google Maps API key
      <GoogleMapReact
        bootstrapURLKeys={{
          key: '',
          language: 'uk',
          region: 'UA',
        }}
        defaultCenter={{ lat: initialLat, lng: initialLng }}
        defaultZoom={5.7}
        distanceToMouse={distanceToMouse}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
      >
        {validPoints.map(
          ({ latitude, longitude, _id, title, placetype, price, isbooked, photos }) => (
            <MyMarker
              key={_id}
              lat={parseFloat(latitude)}
              lng={parseFloat(longitude)}
              text={_id}
              tooltip={title}
              placetype={placetype}
              price={price}
              isbooked={isbooked}
              photos={photos}
              isOpen={openMarkerId === _id}
              onToggle={() => toggleMarker(_id)}
              onMapClick={handleOutsideClick}
            />
          ),
        )}
      </GoogleMapReact>
    </div>
  );
}
