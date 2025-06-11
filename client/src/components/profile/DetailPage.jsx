import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import BookingWidget from './BookingWidget';
import PlaceGallery from './PlaceGallery';
import AddressLink from './AddressLink';
import { url } from '../../utils/Constants';
import CircularProgress from '@mui/material/CircularProgress';
import { UserContext } from '../../context/UserContext.jsx';
import swal from 'sweetalert';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setSelectedChat } = useContext(UserContext);
  const navigate = useNavigate();

  // Словник перекладу типів приміщень
  const translatePlaceType = {
    Flat: 'Квартира',
    Hotel: 'Готель',
    Room: 'Кімната',
  };

  useEffect(() => {
    if (!id) {
      setError('Невалідний ідентифікатор місця.');
      setIsLoading(false);
      return;
    }

    axios
      .get(`${url}/places/${id}`)
      .then((response) => {
        setPlace(response.data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Сервер тимчасово недоступний.');
        setIsLoading(false);
        swal({
          title: 'Помилка!',
          text: 'Не вдалося завантажити дані.',
          icon: 'error',
          button: 'Ок',
        });
      });
  }, [id]);

  const openChat = async (guestId) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token'),
        },
      };
      const { data } = await axios.post(`${url}/chats`, { guestuserId: guestId }, config);
      setSelectedChat(data);
      navigate('/chats');
    } catch (error) {
      swal({
        title: 'Помилка!',
        text: 'Не вдалося відкрити чат.',
        icon: 'error',
        button: 'Ок',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="section">
        <div className="circle">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="section">
        <div className="empty-state">
          <h1 className="text-2xl font-semibold">Помилка</h1>
          <p className="text-gray-500 mt-2">{error || 'Дані відсутні.'}</p>
          <Link to="/" className="btn btn-primary mt-4" aria-label="Перейти на головну">
            Перейти на головну
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-4">
          <h1 className="text-3xl font-semibold">{place.title}</h1>
          <div className="flex gap-2">
            <Link
              to={`/${place.placetype.toLowerCase()}`}
              className="btn btn-primary"
              aria-label="Назад до списку"
            >
              <ArrowLeft className="lucide" />
              Назад
            </Link>
            <button
              onClick={() => openChat(place.owner)}
              className="btn btn-outline-primary"
              aria-label="Зв'язатись з власником"
            >
              <MessageSquare className="lucide" />
              Зв'язатись
            </button>
          </div>
        </div>
        <AddressLink className="my-4">{place.address}</AddressLink>
        <PlaceGallery place={place} />
        <div className="mt-8 grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Опис</h2>
              <p className="text-gray-700 mt-2">{place.description}</p>
            </div>
            <div className="text-gray-700 space-y-1">
              <p>Час заїзду: {place.checkIn}</p>
              <p>Час виїзду: {place.checkOut}</p>
              <p>Максимальна кількість гостей: {place.maxGuests}</p>
              <p>Тип приміщення: {translatePlaceType[place.placetype] || place.placetype}</p>
              <p>
                Власник: {place.ownername} {place.ownerlast}
              </p>
            </div>
          </div>
          <div>
            <br />
            <BookingWidget place={place} />
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold">Додаткова інформація</h2>
          <p className="text-gray-700 mt-2 leading-5">
            {place.extraInfo || 'Немає додаткової інформації.'}
          </p>
        </div>
      </div>
    </div>
  );
}
