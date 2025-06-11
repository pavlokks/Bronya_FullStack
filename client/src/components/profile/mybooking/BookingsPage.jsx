// client\src\components\profile\mybooking\BookingsPage.jsx
import AccountNav from '../AccountNav';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import PlaceImg from '../PlaceImg';
import { Link, useNavigate } from 'react-router-dom';
import BookingDates from './BookingDates';
import { url } from '../../../utils/Constants';
import CircularProgress from '@mui/material/CircularProgress';
import { UserContext } from '../../../context/UserContext.jsx';
import swal from 'sweetalert';
import { Eye, X } from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const authToken = localStorage.getItem('token');
  const { islogin } = useContext(UserContext);
  const navigate = useNavigate();

  const cancelbooking = async (id) => {
    try {
      const res = await fetch(`${url}/booking/cancelbooking/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', token: authToken },
      });
      const data = await res.json();

      if (res.status === 400 || !data) {
        swal({
          title: 'Помилка!',
          text: data.message || 'Помилка при скасуванні',
          icon: 'error',
          button: 'Ок',
        });
      } else {
        swal({
          title: 'Успіх!',
          text: 'Бронювання скасовано!',
          icon: 'success',
          button: 'Ок',
        });
        getBookings();
      }
    } catch (error) {
      swal({
        title: 'Сервер не відповідає!',
        text: 'Помилка',
        icon: 'error',
        button: 'Ок',
      });
    }
  };

  const getBookings = async () => {
    try {
      const response = await axios.get(`${url}/booking/allbookings`, {
        headers: { 'Content-Type': 'application/json', token: authToken },
      });
      setBookings(response.data);
      setIsLoading(false);
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: 'Сервер не відповідає!',
        icon: 'error',
        button: 'Ок',
      });
    }
  };

  useEffect(() => {
    if (!islogin) {
      swal({
        title: 'Потрібен вхід!',
        text: 'Перейдіть на сторінку входу!',
        icon: 'error',
        button: 'Ок',
      });
      navigate('/login');
    } else {
      getBookings();
    }
  }, []);

  const perkTranslations = {
    wifi: 'Wi-Fi',
    parking: 'Парковка',
    tv: 'Телевізор',
    radio: 'Радіо',
    pets: 'Домашні тварини',
    entrance: 'Приватний вхід',
  };

  const translatePerks = (perksArray) => {
    if (!perksArray || perksArray.length === 0) return 'Немає переваг';
    return perksArray.map((perk) => perkTranslations[perk] || perk).join(' • ');
  };

  return (
    <div className="section">
      <AccountNav />
      <div className="outer-border p-6">
        {isLoading ? (
          <div className="circle">
            <CircularProgress />
          </div>
        ) : !bookings ? (
          <div className="container mt-6 text-center">
            <div className="error-state p-6">
              <h1 className="text-2xl font-semibold">Помилка!</h1>
              <p className="text-gray-500 mt-2">Не вдалося завантажити дані.</p>
              <Link to="/" className="btn btn-primary mt-4">
                Перейти на головну
              </Link>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="container mt-6 text-center">
            <div className="empty-state p-6">
              <h1 className="text-2xl font-semibold">Дані відсутні</h1>
              <p className="text-gray-500 mt-2">Наразі немає доступних даних для відображення.</p>
              <Link to="/" className="btn btn-primary mt-4">
                Перейти на головну
              </Link>
            </div>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} className="card my-4 p-4">
              <div className="row align-items-center">
                <div className="col-md-12 col-lg-3 mb-4 mb-lg-0">
                  <div className="bg-image rounded-2xl h-48 overflow-hidden">
                    <PlaceImg place={booking.place} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="col-md-6">
                  <h5 className="text-xl font-semibold">{booking.place.title}</h5>
                  <BookingDates booking={booking} className="text-gray-500 mt-2" />
                  <p className="text-muted mt-1">{translatePerks(booking.place.perks)}</p>
                  <p className="text-muted">
                    Власник:{' '}
                    <span className="text-primary">
                      {booking.place.ownername} {booking.place.ownerlast}
                    </span>
                  </p>
                  <p className="text-truncate mt-1">{booking.place.description}</p>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="d-flex flex-column h-100 justify-content-between">
                    <div>
                      <h4 className="text-2xl font-semibold">₴{booking.price}</h4>
                      <p className="text-success mt-1">{booking.place.address}</p>
                    </div>
                    <div className="mt-4 gap-2 d-flex flex-column">
                      <Link
                        to={`/profile/bookings/${booking._id}`}
                        className="btn btn-primary btn-sm w-full"
                        aria-label="Переглянути деталі"
                      >
                        <Eye className="lucide" /> Деталі
                      </Link>
                      <button
                        className="btn btn-outline-primary btn-sm w-full"
                        onClick={() => cancelbooking(booking._id)}
                        aria-label="Скасувати бронювання"
                      >
                        <X className="lucide" /> Скасувати
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
