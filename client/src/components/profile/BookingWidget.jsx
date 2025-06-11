import { useContext, useEffect, useState } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { url } from '../../utils/Constants';
import { UserContext } from '../../context/UserContext.jsx';
import swal from 'sweetalert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [guestError, setGuestError] = useState('');
  const [dateError, setDateError] = useState('');
  const [occupiedDates, setOccupiedDates] = useState([]);
  const { islogin, user } = useContext(UserContext);
  const authToken = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${url}/booking/occupied-dates/${place._id}`)
      .then((response) => {
        const dates = response.data.map((date) => new Date(date));
        setOccupiedDates(dates);
      })
      .catch((err) => {
        console.error('Fetching occupied dates error:', err);
      });
  }, [place._id]);

  useEffect(() => {
    if (numberOfGuests > place.maxGuests) {
      setGuestError(`Максимальна кількість гостей: ${place.maxGuests}`);
    } else if (numberOfGuests < 1) {
      setGuestError('Кількість гостей має бути більше 0');
    } else {
      setGuestError('');
    }
  }, [numberOfGuests, place.maxGuests]);

  useEffect(() => {
    if (checkIn && checkOut) {
      if (checkIn >= checkOut) {
        setDateError('Дата виїзду має бути пізніше дати заїзду.');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  }, [checkIn, checkOut]);

  const numberOfNights = checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;

  const isFormValid =
    checkIn &&
    checkOut &&
    user?.username &&
    user?.phone &&
    numberOfGuests > 0 &&
    numberOfNights > 0 &&
    !guestError &&
    !dateError;

  async function initiateLiqPayPayment() {
    if (!islogin) {
      swal({
        title: 'Потрібен вхід!',
        text: 'Перейдіть на сторінку входу!',
        icon: 'error',
        button: 'Ок',
      });
      navigate('/login');
      return;
    }

    if (guestError || dateError) {
      swal({
        title: 'Помилка!',
        text: guestError || dateError,
        icon: 'error',
        button: 'Ок',
      });
      return;
    }

    try {
      const checkInDate = new Date(
        Date.UTC(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate()),
      );
      const checkOutDate = new Date(
        Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate()),
      );

      const response = await axios.post(
        `${url}/booking/liqpay`,
        {
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          numberOfGuests,
          name: user.username,
          phone: user.phone,
          place: place._id,
          price: numberOfNights * place.price,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            token: authToken,
          },
        },
      );
      const { data, signature } = response.data;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.liqpay.ua/api/3/checkout';
      form.acceptCharset = 'utf-8';

      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'data';
      dataInput.value = data;
      form.appendChild(dataInput);

      const signatureInput = document.createElement('input');
      signatureInput.type = 'hidden';
      signatureInput.name = 'signature';
      signatureInput.value = signature;
      form.appendChild(signatureInput);

      const resultUrlInput = document.createElement('input');
      resultUrlInput.type = 'hidden';
      resultUrlInput.name = 'result_url';
      resultUrlInput.value = `${window.location.origin}/profile/bookings`;
      form.appendChild(resultUrlInput);

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      swal({
        title: 'Помилка!',
        text: err.response?.data?.error || 'Помилка при підготовці оплати!',
        icon: 'error',
        button: 'Ок',
      });
    }
  }

  return (
    <div className="card p-4">
      <h3 className="text-xl text-center mb-4 font-semibold">Ціна: ₴{place.price} / за ніч</h3>
      <div className="card p-4 space-y-6">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <label htmlFor="checkIn" className="text-sm">
              Дата заїзду
            </label>
            <DatePicker
              id="checkIn"
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              minDate={new Date()}
              excludeDates={occupiedDates}
              dateFormat="yyyy-MM-dd"
              placeholderText="Виберіть дату"
              aria-label="Дата заїзду"
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="checkOut" className="text-sm">
              Дата виїзду
            </label>
            <DatePicker
              id="checkOut"
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              minDate={checkIn || new Date()}
              excludeDates={occupiedDates}
              dateFormat="yyyy-MM-dd"
              placeholderText="Виберіть дату"
              aria-label="Дата виїзду"
              className="input-field"
            />
          </div>
        </div>
        {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
        <div>
          <label htmlFor="guests" className="text-sm">
            Кількість гостей
          </label>
          <input
            id="guests"
            type="number"
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
            min="1"
            className="input-field"
            aria-label="Кількість гостей"
          />
          {guestError && <p className="text-red-500 text-sm mt-1">{guestError}</p>}
        </div>
        {numberOfNights > 0 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="text-sm">
                Ваше повне ім’я
              </label>
              <input
                id="username"
                type="text"
                value={user?.username || ''}
                disabled
                className="input-field"
                aria-label="Повне ім’я"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm">
                Номер телефону
              </label>
              <input
                id="phone"
                type="tel"
                value={user?.phone || ''}
                disabled
                className="input-field"
                aria-label="Номер телефону"
              />
            </div>
          </div>
        )}
      </div>
      <button
        onClick={initiateLiqPayPayment}
        disabled={!isFormValid}
        className="btn btn-primary w-full mt-4"
        aria-label="Забронювати"
      >
        Забронювати {numberOfNights > 0 && <span> ₴{numberOfNights * place.price}</span>}
      </button>
    </div>
  );
}
