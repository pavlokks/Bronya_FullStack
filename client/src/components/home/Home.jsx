import { useEffect, useState } from 'react';
import CommonCards from './CommonCards';
import FeaturedCards from './FeaturedCards';
import SlidingBrands from './SlidingBrands';
import Welcome from './Welcome';
import swal from 'sweetalert';
import CircularProgress from '@mui/material/CircularProgress';
import { url } from '../../utils/Constants';

const Home = () => {
  const flat = [
    {
      address: 'Київ, Київська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/flat/flat1.jpg'),
      link: '/flat',
      title: 'Квартира у Києві',
    },
    {
      address: 'Львів, Львівська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/flat/flat2.jpg'),
      link: '/flat',
      title: 'Квартира у Львові',
    },
    {
      address: 'Херсон, Херсонська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/flat/flat3.jpg'),
      link: '/flat',
      title: 'Квартира у Херсоні',
    },
  ];

  const hotel = [
    {
      address: 'Київ, Київська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/hotel/hotel1.jpg'),
      link: '/hotel',
      title: 'Готель у Києві',
    },
    {
      address: 'Львів, Львівська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/hotel/hotel2.jpg'),
      link: '/hotel',
      title: 'Готель у Львові',
    },
    {
      address: 'Херсон, Херсонська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/hotel/hotel3.jpg'),
      link: '/hotel',
      title: 'Готель у Херсоні',
    },
  ];

  const room = [
    {
      address: 'Київ, Київська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/room/room1.jpg'),
      link: '/room',
      title: 'Кімната у Києві',
    },
    {
      address: 'Львів, Львівська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/room/room2.jpg'),
      link: '/room',
      title: 'Кімната у Львові',
    },
    {
      address: 'Херсон, Херсонська область',
      subtitle: 'Для студентів',
      image: require('../../assets/media/images/room/room3.jpg'),
      link: '/room',
      title: 'Кімната у Херсоні',
    },
  ];

  const [hotels, setHotels] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [flats, setFlats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getHotels = async () => {
    setIsLoading(true);
    try {
      const req = `${url}/places?page=1&size=10&address=${''}&placetype=hotel`;
      const response = await fetch(req, {
        method: 'GET',
        mode: 'cors',
        referrerPolicy: 'origin-when-cross-origin',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      const responseData = await response.json();
      if (response.status === 200) {
        setHotels(responseData.placesdata);
      }
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: 'Сервер не відповідає!',
        icon: 'error',
        button: 'ОК',
      });
    }
    setIsLoading(false);
  };

  const getRooms = async () => {
    setIsLoading(true);
    try {
      const req = `${url}/places?page=1&size=10&address=${''}&placetype=room`;
      const response = await fetch(req, {
        method: 'GET',
        mode: 'cors',
        referrerPolicy: 'origin-when-cross-origin',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      const responseData = await response.json();
      if (response.status === 200) {
        setRooms(responseData.placesdata);
      }
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: 'Сервер не відповідає!',
        icon: 'error',
        button: 'ОК',
      });
    }
    setIsLoading(false);
  };

  const getFlats = async () => {
    setIsLoading(true);
    try {
      const req = `${url}/places?page=1&size=10&address=${''}&placetype=flat`;
      const response = await fetch(req, {
        method: 'GET',
        mode: 'cors',
        referrerPolicy: 'origin-when-cross-origin',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      const responseData = await response.json();
      if (response.status === 200) {
        setFlats(responseData.placesdata);
      }
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: 'Сервер не відповідає!',
        icon: 'error',
        button: 'ОК',
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getHotels();
    getFlats();
    getRooms();
  }, []);

  return (
    <div className="home-section">
      <Welcome />
      <SlidingBrands title="Знайдіть своє місце" small="Ваші улюблені міста" />
      {isLoading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : !rooms ? (
        <div className="container error-message">
          <h1>Помилка!</h1>
          <p>Не вдалося завантажити дані.</p>
        </div>
      ) : rooms.length === 0 ? null : (
        <FeaturedCards images={rooms} type="Room" />
      )}
      <CommonCards
        images={room}
        heading="Кімнати"
        content="Орендуйте кімнату легко й швидко"
        type="Room"
      />
      <hr className="separator" />
      {isLoading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : !hotels ? (
        <div className="container error-message">
          <h1>Помилка!</h1>
          <p>Не вдалося завантажити дані.</p>
        </div>
      ) : hotels.length === 0 ? null : (
        <FeaturedCards images={hotels} type="Hotel" />
      )}
      <CommonCards
        images={hotel}
        heading="Готелі"
        content="Комфортні готелі — оберіть свій"
        type="Hotel"
      />
      <hr className="separator" />
      {isLoading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : !flats ? (
        <div className="container error-message">
          <h1>Помилка!</h1>
          <p>Не вдалося завантажити дані.</p>
        </div>
      ) : flats.length === 0 ? null : (
        <FeaturedCards images={flats} type="Flat" />
      )}
      <CommonCards
        images={flat}
        heading="Квартири"
        content="Квартири, які чекають на вас"
        type="Flat"
      />
    </div>
  );
};

export default Home;
