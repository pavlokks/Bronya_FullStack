import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import PlaceGallery from '../PlaceGallery';
import AddressLink from '../AddressLink';
import { url } from '../../../utils/Constants';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext.jsx';
import swal from 'sweetalert';
import CircularProgress from '@mui/material/CircularProgress';

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const authToken = localStorage.getItem('token');
  const { islogin } = useContext(UserContext);
  const navigate = useNavigate();

  const getUserPlace = async (id) => {
    try {
      if (!id) return;
      const response = await axios.get(`${url}/places/${id}`, {
        headers: { 'Content-Type': 'application/json', token: authToken },
      });
      setPlace(response.data);
      setIsLoading(false);
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: 'Сервер не працює!',
        icon: 'error',
        button: 'Ок!',
      });
    }
  };

  const deletePlace = async (id) => {
    try {
      const res = await fetch(`${url}/hosting/deleteplace/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', token: authToken },
      });
      const data = await res.json();

      if (res.status === 400 || !data) {
        swal({
          title: 'Спробуйте ще раз!',
          text: 'Помилка',
          icon: 'error',
          button: 'Ок!',
        });
      } else {
        swal({
          title: 'Видалено!',
          text: 'Успішно видалено!',
          icon: 'success',
          button: 'Ок!',
        });
        navigate('/profile/places');
      }
    } catch (error) {
      swal({
        title: 'Сервер не працює!',
        text: 'Помилка',
        icon: 'error',
        button: 'Ок!',
      });
    }
  };

  useEffect(() => {
    if (!islogin) {
      swal({
        title: 'Потрібен вхід!',
        text: 'Перейдіть на сторінку входу!',
        icon: 'error',
        button: 'Ок!',
      });
      navigate('/login');
    } else {
      getUserPlace(id);
    }
  }, [id, islogin, navigate]);

  if (!place && !isLoading) {
    return (
      <div className="section">
        <div className="container mt-6 text-center">
          <div className="empty-state p-6">
            <h1 className="text-2xl font-semibold">Немає даних</h1>
            <p className="text-gray-500 mt-2">Наразі немає доступних даних для відображення.</p>
            <Link to="/profile/places" className="btn btn-primary mt-4">
              Повернутися до моїх помешкань
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section mx-8 p-6">
      {isLoading ? (
        <div className="circle">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">{place.title}</h1>
            <div className="flex gap-2">
              <Link to="/profile/places" className="btn btn-primary">
                Повернутися до моїх помешкань
              </Link>
              <button onClick={() => deletePlace(place._id)} className="btn btn-outline-primary">
                Видалити це місце
              </button>
            </div>
          </div>
          <AddressLink className="block mb-4">{place.address}</AddressLink>
          <PlaceGallery place={place} />
          <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
            <div>
              <div className="my-4">
                <h2 className="font-semibold text-2xl">Опис</h2>
              </div>
              <div className="text-gray-700">
                Заїзд: {place.checkIn}
                <br />
                Виїзд: {place.checkOut}
                <br />
                Максимальна кількість гостей: {place.maxGuests}
                <br />
                Тип місця: {place.placetype}
              </div>
              <div className="my-4">
                {' '}
                <p>{place.description}</p>
              </div>
            </div>
          </div>
          <div className="bg-white -mx-8 px-8 py-8 border-t">
            <div>
              <h2 className="font-semibold text-2xl">Додаткова інформація</h2>
            </div>
            <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">{place.extraInfo}</div>
          </div>
        </>
      )}
    </div>
  );
}
