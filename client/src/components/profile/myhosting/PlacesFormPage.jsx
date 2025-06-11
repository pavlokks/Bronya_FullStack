import PhotosUploader from '../PhotosUploader.jsx';
import Perks from '../Perks.jsx';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AccountNav from '../AccountNav';
import { Navigate, useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { url } from '../../../utils/Constants';
import list from '../../../assets/data/cities.json';
import swal from 'sweetalert';

export default function PlacesFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [placetype, setPlacetype] = useState('');
  const [address, setAddress] = useState('');
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [latitude, setLocalLatitude] = useState('');
  const [longitude, setLocalLongitude] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const authToken = localStorage.getItem('token');
  const navigate = useNavigate();

  // Завантаження даних місця, якщо є id, або ініціалізація координат
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const newLat = query.get('lat');
    const newLng = query.get('lng');

    if (!authToken) {
      swal({
        title: 'Потрібен вхід!',
        text: 'Перейдіть на сторінку входу!',
        icon: 'error',
        button: 'Ок!',
      });
      navigate('/login');
      return;
    }

    if (id) {
      setIsLoading(true);
      axios
        .get(`${url}/places/${id}`, {
          headers: { 'Content-Type': 'application/json', token: authToken },
        })
        .then((response) => {
          const { data } = response;
          setTitle(data.title || '');
          setPlacetype(data.placetype || '');
          setAddress(data.address || '');
          setAddedPhotos(data.photos || []);
          setDescription(data.description || '');
          setPerks(data.perks || []);
          setExtraInfo(data.extraInfo || '');
          setCheckIn((data.checkIn || '').toString());
          setCheckOut((data.checkOut || '').toString());
          setMaxGuests(data.maxGuests || 1);
          setPrice(data.price || 100);
          setLocalLatitude(newLat || data.latitude || '');
          setLocalLongitude(newLng || data.longitude || '');
          setIsLoading(false);
        })
        .catch((err) => {
          swal({
            title: 'Помилка!',
            text: 'Сервер не працює!',
            icon: 'error',
            button: 'Ок!',
          });
          setIsLoading(false);
        });
    } else {
      setLocalLatitude(newLat || '');
      setLocalLongitude(newLng || '');
      setIsLoading(false);
    }
  }, [id, authToken, navigate, location.search]);

  // Функція для створення заголовка поля
  function inputHeader(text) {
    return <h2 className="text-2xl mt-4 font-semibold">{text}</h2>;
  }

  // Функція для створення опису поля
  function inputDescription(text) {
    return <p className="text-gray-500 text-sm mb-2">{text}</p>;
  }

  // Комбінація заголовка та опису
  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  // Валідація форми
  function validateForm() {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Назва є обов’язковою.';
    if (!placetype.trim()) newErrors.placetype = 'Тип житла є обов’язковим.';
    if (!address.trim()) newErrors.address = 'Адреса є обов’язковою.';
    if (addedPhotos.length === 0) newErrors.photos = 'Потрібно додати принаймні одну фотографію.';
    if (!checkIn || !checkIn.trim()) newErrors.checkIn = 'Час заїзду є обов’язковим.';
    if (!checkOut || !checkOut.trim()) newErrors.checkOut = 'Час виїзду є обов’язковим.';
    if (!maxGuests || maxGuests < 1) newErrors.maxGuests = 'Максимальна кількість гостей недійсна.';
    if (!price || price < 1) newErrors.price = 'Ціна за ніч недійсна.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Збереження або оновлення місця
  async function savePlace(ev) {
    ev.preventDefault();
    if (!validateForm()) {
      swal({
        title: 'Помилка!',
        text: 'Будь ласка, заповніть усі обов’язкові поля.',
        icon: 'error',
        button: 'Ок!',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const placeData = {
        id,
        title,
        address,
        placetype,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
        latitude,
        longitude,
      };
      if (id) {
        await axios.put(`${url}/hosting/update`, placeData, {
          headers: { 'Content-Type': 'application/json', token: authToken },
        });
        swal({
          title: 'Успіх!',
          text: 'Житло успішно оновлено!',
          icon: 'success',
          button: 'Ок!',
        });
      } else {
        await axios.post(`${url}/hosting/upload`, placeData, {
          headers: { 'Content-Type': 'application/json', token: authToken },
        });
        swal({
          title: 'Успіх!',
          text: 'Житло успішно створено!',
          icon: 'success',
          button: 'Ок!',
        });
      }
      setRedirect(true);
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: err.response?.data?.error || 'Сервер не працює!',
        icon: 'error',
        button: 'Ок!',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (redirect) return <Navigate to="/profile/places" />;

  if (isLoading)
    return (
      <div className="section flex justify-center items-center min-h-[150px]">Завантаження...</div>
    );

  return (
    <div className="section">
      <AccountNav />
      <div className="card p-6">
        <h1 className="text-2xl mb-4 font-semibold">
          {id ? 'Редагувати місце' : 'Додати нове місце'}
        </h1>
        <form onSubmit={savePlace}>
          {preInput('Додати локацію на карті', 'Спочатку виберіть локацію на карті')}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-700">
              Широта: {latitude || 'Не вказано'} • Довгота: {longitude || 'Не вказано'}
            </span>
            <button
              type="button"
              onClick={() =>
                navigate(`/map?placeId=${id || ''}&lat=${latitude || ''}&lng=${longitude || ''}`)
              }
              className="btn btn-outline-primary btn-sm"
            >
              Перейти до карти
            </button>
          </div>

          {preInput('Адреса', 'Адреса цього місця')}
          <input
            list="data"
            value={address}
            onChange={(ev) => setAddress(ev.target.value)}
            placeholder="Виберіть..."
            className="input-field mb-2"
          />
          <datalist id="data">
            {list.map((op, i) => (
              <option key={i}>
                {op.name}, {op.state}
              </option>
            ))}
          </datalist>
          {errors.address && <p className="text-red-500 text-sm mb-2">{errors.address}</p>}

          {preInput('Назва', 'Назва вашого місця. Має бути короткою і привабливою')}
          <input
            type="text"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            placeholder="Напр., Моя чудова квартира"
            className="input-field mb-2"
          />
          {errors.title && <p className="text-red-500 text-sm mb-2">{errors.title}</p>}

          {preInput('Тип місця', 'Тип вашого місця')}
          <select
            value={placetype}
            onChange={(ev) => setPlacetype(ev.target.value)}
            className="input-field mb-2"
          >
            <option value="">Виберіть тип місця</option>
            <option value="Hotel">Готель</option>
            <option value="Room">Кімната</option>
            <option value="Flat">Квартира</option>
          </select>
          {errors.placetype && <p className="text-red-500 text-sm mb-2">{errors.placetype}</p>}

          {preInput('Фото', 'Потрібно додати принаймні одну фотографію')}
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
          {errors.photos && <p className="text-red-500 text-sm mb-2">{errors.photos}</p>}

          {preInput('Опис', 'Опис місця')}
          <textarea
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            className="input-field mb-2 min-h-[150px]"
          />
          {preInput('Переваги', 'Виберіть усі переваги вашого місця')}
          <Perks selected={perks} onChange={setPerks} />
          {preInput('Додаткова інформація', 'Правила будинку тощо')}
          <textarea
            value={extraInfo}
            onChange={(ev) => setExtraInfo(ev.target.value)}
            className="input-field mb-2 min-h-[150px]"
          />
          {preInput('Час заїзду та виїзду', 'Додайте час заїзду та виїзду')}
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4 mb-2">
            <div>
              <h3 className="mt-2 mb-1 font-medium">Час заїзду</h3>
              <input
                type="text"
                value={checkIn}
                onChange={(ev) => setCheckIn(ev.target.value.toString())}
                placeholder="14"
                className="input-field"
              />
              {errors.checkIn && <p className="text-red-500 text-sm">{errors.checkIn}</p>}
            </div>
            <div>
              <h3 className="mt-2 mb-1 font-medium">Час виїзду</h3>
              <input
                type="text"
                value={checkOut}
                onChange={(ev) => setCheckOut(ev.target.value.toString())}
                placeholder="11"
                className="input-field"
              />
              {errors.checkOut && <p className="text-red-500 text-sm">{errors.checkOut}</p>}
            </div>
            <div>
              <h3 className="mt-2 mb-1 font-medium">Максимальна кількість гостей</h3>
              <input
                type="number"
                value={maxGuests}
                onChange={(ev) => setMaxGuests(ev.target.value)}
                className="input-field"
              />
              {errors.maxGuests && <p className="text-red-500 text-sm">{errors.maxGuests}</p>}
            </div>
            <div>
              <h3 className="mt-2 mb-1 font-medium">Ціна за ніч</h3>
              <input
                type="number"
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
                className="input-field"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </button>
            <Link to="/profile/places" className="btn btn-outline-primary">
              Назад
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
