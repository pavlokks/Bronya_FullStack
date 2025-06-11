// client\src\components\profile\mybooking\BookingPage.jsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AddressLink from '../AddressLink';
import PlaceGallery from '../PlaceGallery';
import BookingDates from './BookingDates';
import { url } from '../../../utils/Constants';
import CircularProgress from '@mui/material/CircularProgress';
import { UserContext } from '../../../context/UserContext.jsx';
import swal from 'sweetalert';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function BookingPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const authToken = localStorage.getItem('token');
  const { islogin, setSelectedChat } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!islogin) {
      swal({
        title: 'Потрібен вхід!',
        text: 'Перейдіть на сторінку входу!',
        icon: 'error',
        button: 'Ок',
      });
      navigate('/login');
    } else if (id) {
      axios
        .get(`${url}/booking/allbookings`, {
          headers: { 'Content-Type': 'application/json', token: authToken },
        })
        .then((response) => {
          const foundBooking = response.data.find(({ _id }) => _id === id);
          setBooking(foundBooking);
          setIsLoading(false);
        })
        .catch(() => {
          swal({
            title: 'Спробуйте ще раз!',
            text: 'Сервер не відповідає!',
            icon: 'error',
            button: 'Ок',
          });
        });
    }
  }, [id, islogin, navigate]);

  const accessChat = async (guestuserId) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json', token: localStorage.getItem('token') },
      };
      const { data } = await axios.post(`${url}/chats`, { guestuserId }, config);
      setSelectedChat(data);
      navigate('/chats');
    } catch (error) {
      swal({
        title: 'Помилка!',
        text: 'Не вдалося завантажити чат',
        icon: 'error',
        button: 'Ок',
      });
    }
  };

  if (!booking && !isLoading) {
    return (
      <div className="section">
        <div className="container mt-6 text-center">
          <div className="empty-state p-6">
            <h1 className="text-2xl font-semibold">Дані відсутні</h1>
            <p className="text-gray-500 mt-2">Наразі немає доступних даних для відображення.</p>
            <Link to="/profile/bookings" className="btn btn-primary mt-4">
              <ArrowLeft className="lucide" /> Назад до моїх бронювань
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="mx-8 p-6">
        {isLoading ? (
          <div className="circle">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-semibold">{booking.place.title}</h1>
              <div className="flex gap-2">
                <Link to="/profile/bookings" className="btn btn-primary">
                  <ArrowLeft className="lucide" /> Назад до моїх бронювань
                </Link>
                <button
                  onClick={() => accessChat(booking.place.owner)}
                  className="btn btn-primary"
                  aria-label="Чат з власником"
                >
                  <MessageSquare className="lucide" /> Чат з власником
                </button>
              </div>
            </div>
            <AddressLink className="block mb-4">{booking.place.address}</AddressLink>
            <div className="bg-gray-200 p-6 my-6 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Інформація про бронювання:</h2>
                <BookingDates booking={booking} />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow text-primary text-center">
                <div className="text-sm">Загальна сума</div>
                <div className="text-3xl font-semibold">₴{booking.price}</div>
              </div>
            </div>
            <PlaceGallery place={booking.place} />
          </>
        )}
      </div>
    </div>
  );
}
