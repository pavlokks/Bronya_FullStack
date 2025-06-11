import { Link, useNavigate } from 'react-router-dom';
import AccountNav from '../AccountNav';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { url } from '../../../utils/Constants';
import { UserContext } from '../../../context/UserContext.jsx';
import swal from 'sweetalert';
import CircularProgress from '@mui/material/CircularProgress';
import { Plus } from 'lucide-react';

export default function PlacesPage() {
  const [places, setPlaces] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const authToken = localStorage.getItem('token');
  const { islogin } = useContext(UserContext);
  const navigate = useNavigate();

  // Отримання даних про місця
  const getPlacesData = async () => {
    try {
      const { data } = await axios.get(`${url}/hosting/user-places`, {
        headers: { 'Content-Type': 'application/json', token: authToken },
      });
      setPlaces(data);
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
      getPlacesData();
    }
  }, [islogin, navigate]);

  // Переклад переваг
  const perkTranslations = {
    wifi: 'Wi-Fi',
    parking: 'Парковка',
    tv: 'Телевізор',
    radio: 'Радіо',
    pets: 'Домашні тварини',
    entrance: 'Приватний вхід',
  };

  // Функція для перекладу переваг
  const translatePerks = (perksArray) => {
    if (!perksArray || perksArray.length === 0) return 'Немає переваг';
    return perksArray.map((perk) => perkTranslations[perk] || perk).join(' • ');
  };

  // Функція для визначення ціни та одиниці виміру
  const getPriceDetails = (placetype, price) => {
    if (placetype === 'Flat') {
      return { price: price * 30, unit: 'за місяць' };
    }
    return { price: price, unit: 'за ніч' };
  };

  return (
    <div className="section">
      <AccountNav />
      <div className="flex justify-end mb-4">
        <Link
          to="/profile/places/new"
          className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          aria-label="Додати нове приміщення"
        >
          <Plus className="lucide" /> Додати нове приміщення
        </Link>
      </div>
      <div className="mx-4 my-4 p-6 outer-border">
        {isLoading ? (
          <div className="circle">
            <CircularProgress />
          </div>
        ) : !places ? (
          <div className="container mt-6 text-center">
            <div className="error-state p-6">
              <h1 className="text-2xl font-semibold">Помилка!</h1>
              <p className="text-gray-500 mt-2">Не вдалося завантажити!</p>
            </div>
          </div>
        ) : places.length === 0 ? (
          <div className="container mt-6 text-center">
            <div className="empty-state p-6">
              <h1 className="text-2xl font-semibold">Немає даних</h1>
              <p className="text-gray-500 mt-2">Наразі немає доступних даних для відображення.</p>
            </div>
          </div>
        ) : (
          places.map((place) => {
            const { price: adjustedPrice, unit } = getPriceDetails(place.placetype, place.price);
            return (
              <div key={place._id} className="card my-4 p-4">
                <div className="row align-items-center">
                  <div className="col-md-12 col-lg-3 mb-4 mb-lg-0">
                    <div className="bg-image rounded-2xl h-48 overflow-hidden">
                      {place.photos?.[0] ? (
                        <img
                          src={place.photos[0]}
                          alt="Фото місця"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <p className="text-gray-500">Немає фото</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h5 className="text-xl font-semibold">{place.title}</h5>
                    <p className="text-muted mt-1">{translatePerks(place.perks)}</p>
                    <p className="text-muted mt-1">
                      Власник:{' '}
                      <span className="text-primary">
                        {place.ownername} {place.ownerlast}
                      </span>
                    </p>
                    <p className="text-truncate mt-1">{place.description}</p>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <div className="d-flex flex-column h-100 justify-content-between">
                      <div>
                        <h4 className="text-2xl font-semibold">
                          ₴{adjustedPrice} {unit}
                        </h4>
                        <p className="text-success mt-1">{place.address}</p>
                      </div>
                      <div className="mt-4 gap-2 d-flex flex-column">
                        <Link to={`/place/${place._id}`} className="btn btn-primary btn-sm w-full">
                          Деталі
                        </Link>
                        <Link
                          to={`/profile/places/${place._id}`}
                          className="btn btn-outline-primary btn-sm w-full"
                        >
                          Змінити деталі
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
