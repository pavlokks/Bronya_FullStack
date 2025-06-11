const express = require('express');
const Router = express.Router();
const moment = require('moment-timezone');
const User = require('../models/User.js');
const Booking = require('../models/Booking.js');
const Place = require('../models/Place.js');
const fetchUser = require('../middleware/fetchUserFromToken');
const crypto = require('crypto');

// Налаштування ключів LiqPay з .env
const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY;
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;

// Тимчасове сховище для параметрів бронювання
const pendingBookings = new Map();

// Функція для генерації data і signature
const generateLiqPayParams = (params) => {
  const data = Buffer.from(JSON.stringify(params)).toString('base64');
  const signString = LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY;
  const signature = crypto.createHash('sha1').update(signString).digest().toString('base64');
  return { data, signature };
};

// Функція для нормалізації дати до YYYY-MM-DD
const normalizeDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

// Функція для перевірки перетину дат
const isDateRangeAvailable = async (placeId, checkIn, checkOut) => {
  const newCheckIn = normalizeDate(checkIn);
  const newCheckOut = normalizeDate(checkOut);

  const existingBookings = await Booking.find({ place: placeId });

  for (const booking of existingBookings) {
    const existingCheckIn = normalizeDate(booking.checkIn);
    const existingCheckOut = normalizeDate(booking.checkOut);
    if (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn) {
      return false;
    }
  }
  return true;
};

// Ендпоінт для отримання зайнятих дат
Router.get('/occupied-dates/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const bookings = await Booking.find({ place: placeId }, { checkIn: 1, checkOut: 1 });

    const occupiedDates = [];
    bookings.forEach((booking) => {
      let currentDate = normalizeDate(booking.checkIn);
      const checkOutDate = normalizeDate(booking.checkOut);
      // Включаємо checkOut дату
      while (currentDate <= checkOutDate) {
        occupiedDates.push(new Date(currentDate));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
    });

    res.json(occupiedDates.map((date) => date.toISOString().split('T')[0]));
  } catch (error) {
    console.error('Error in /occupied-dates:', error);
    res.status(500).json({ error: 'Error fetching occupied dates' });
  }
});

// Ендпоінт для генерації параметрів LiqPay
Router.post('/liqpay', fetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;

    const placeDoc = await Place.findOne({ _id: place });
    if (!placeDoc) {
      console.log('Place not found for ID:', place);
      return res.status(404).json({ error: 'Житло не знайдено.' });
    }

    // Валідація кількості гостей
    if (numberOfGuests > placeDoc.maxGuests) {
      console.log('Number of guests exceeds maxGuests:', {
        numberOfGuests,
        maxGuests: placeDoc.maxGuests,
      });
      return res.status(400).json({
        error: `Кількість гостей (${numberOfGuests}) перевищує максимальну (${placeDoc.maxGuests}).`,
      });
    }

    const isAvailable = await isDateRangeAvailable(place, checkIn, checkOut);
    if (!isAvailable) {
      console.log('Dates are not available for place:', place);
      return res.status(400).json({ error: 'Обрані дати недоступні.' });
    }

    const orderId = `BOOK_${place}_${Date.now()}_${userId}`;
    const liqpayParams = {
      public_key: LIQPAY_PUBLIC_KEY,
      version: '3',
      action: 'pay',
      amount: price,
      currency: 'UAH',
      description: `Бронювання: ${placeDoc.title}`,
      order_id: orderId,
      server_url: 'http://localhost:5000/booking/callback',
      result_url: 'http://localhost:3000/profile/bookings',
    };

    pendingBookings.set(orderId, {
      place: placeDoc._id,
      placeowner: placeDoc.owner,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
      userId,
    });
    console.log('Pending booking saved:', { orderId, bookingData: pendingBookings.get(orderId) });

    const { data, signature } = generateLiqPayParams(liqpayParams);
    res.json({ data, signature, orderId });
  } catch (error) {
    console.error('Error in /liqpay:', error);
    res.status(500).json({ error: 'Помилка генерації параметрів LiqPay. Спробуйте ще раз.' });
  }
});

// Ендпоінт для обробки callback від LiqPay
Router.post('/callback', async (req, res) => {
  try {
    const { data, signature } = req.body;
    console.log('Callback received:', { data, signature });

    const signString = LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY;
    const expectedSignature = crypto
      .createHash('sha1')
      .update(signString)
      .digest()
      .toString('base64');

    if (signature !== expectedSignature) {
      console.log('Invalid signature:', { received: signature, expected: expectedSignature });
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const { order_id, status, amount, currency, description } = decodedData;
    console.log('Decoded callback data:', decodedData);

    if (status === 'success') {
      const orderParts = order_id.split('_');
      const placeId = orderParts[1];
      const userId = orderParts[3];

      const placeDoc = await Place.findOne({ _id: placeId });
      if (!placeDoc) {
        console.log('Place not found for ID:', placeId);
        return res.status(404).json({ error: 'Place not found.' });
      }

      const bookingData = pendingBookings.get(order_id);
      if (!bookingData) {
        console.log('Pending booking not found for order_id:', order_id);
        return res.status(404).json({ error: 'Booking data not found.' });
      }

      const isAvailable = await isDateRangeAvailable(
        placeId,
        bookingData.checkIn,
        bookingData.checkOut,
      );
      if (!isAvailable) {
        console.log('Dates are no longer available for place:', placeId);
        return res.status(400).json({ error: 'Selected dates are no longer available.' });
      }

      const datecreated = moment.tz(new Date(), 'Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss');

      const bookingDoc = await Booking.create({
        place: placeDoc._id,
        checkIn: normalizeDate(bookingData.checkIn),
        checkOut: normalizeDate(bookingData.checkOut),
        numberOfGuests: bookingData.numberOfGuests,
        name: bookingData.name,
        phone: bookingData.phone,
        price: amount,
        datecreated,
        owner: placeDoc.owner,
        user: userId,
        order_id: order_id,
      });

      pendingBookings.delete(order_id);
      console.log('Booking created:', bookingDoc);

      res.json({ status: 'success', bookingId: bookingDoc._id });
    } else {
      console.log('Payment not successful, status:', status);
      res.json({ status: 'failure', message: 'Payment not successful', liqpayStatus: status });
    }
  } catch (error) {
    console.error('Error in /callback:', error);
    res.status(500).json({ error: 'Error processing callback' });
  }
});

// Ендпоінт для бронювання
Router.post('/bookings', fetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { place, placeowner, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;

    const placeDoc = await Place.findOne({ _id: place });
    if (!placeDoc) {
      return res.status(404).json({ error: 'Place not found.' });
    }

    const isAvailable = await isDateRangeAvailable(place, checkIn, checkOut);
    if (!isAvailable) {
      console.log('Dates are not available for place:', place);
      return res.status(400).json({ error: 'Selected dates are not available.' });
    }

    const datecreated = moment.tz(new Date(), 'Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss');

    const bookingDoc = await Booking.create({
      place,
      checkIn: normalizeDate(checkIn),
      checkOut: normalizeDate(checkOut),
      numberOfGuests,
      name,
      phone,
      price,
      datecreated,
      owner: placeowner,
      user: userId,
    });

    res.json(bookingDoc);
  } catch (error) {
    console.error('Error in /bookings:', error);
    res.status(500).send('Error while booking. Try again later.');
  }
});

Router.delete('/cancelbooking/:id', fetchUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const bookings = await Booking.findById(id);
    if (!bookings) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(id);

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error in /cancelbooking:', error);
    res.status(400).json(error);
  }
});

Router.get('/allbookings', fetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const booked = await Booking.find({ user: userId }).populate('place').sort({ createdAt: -1 });
    res.send(booked);
  } catch (error) {
    console.error('Error in /allbookings:', error);
    res.status(400).send('Error while getting the list of booked. Try again later.');
  }
});

Router.post('/addsaved/:id', fetchUser, async (req, res) => {
  try {
    const { id } = req.params;

    const saved = await Place.findOne({ _id: id });

    const Usercontact = await User.findOne({ _id: req.userId });

    const exists = Usercontact.saved.some((savedItem) => savedItem._id == id);
    if (exists) {
      return res.status(201).json({ message: 'Already added in wishlist', success: false });
    }

    if (Usercontact) {
      const savedData = await Usercontact.addsaveddata(saved);

      await Usercontact.save();
      res.status(201).json({ message: 'Successfully added in wishlist', success: true });
    }
  } catch (error) {
    console.error('Error in /addsaved:', error);
  }
});

Router.delete('/removesaved/:id', fetchUser, async (req, res) => {
  try {
    const { id } = req.params;

    const userdata = await User.findOne({ _id: req.userId });

    userdata.saved = userdata.saved.filter((cruval) => {
      return cruval._id != id;
    });

    userdata.save();
    res.status(201).json(userdata);
  } catch (error) {
    console.error('Error in /removesaved:', error);
    res.status(400).json(error);
  }
});

Router.get('/savedplaces', fetchUser, async (req, res) => {
  const page = req.query.page || 1;
  const ITEM_PER_PAGE = req.query.size || 6;
  const { address, placetype } = req.query;

  try {
    const skip = (page - 1) * ITEM_PER_PAGE;

    const userdata = await User.findOne({ _id: req.userId });

    const query = {
      ...(address && { address: { $regex: address, $options: 'i' } }),
      ...(placetype && { placetype: { $regex: placetype, $options: 'i' } }),
    };

    const filterFunction = (item) => {
      for (const key in query) {
        if (query.hasOwnProperty(key)) {
          if (typeof query[key] === 'object') {
            const regex = new RegExp(query[key].$regex, query[key].$options);
            if (!regex.test(item[key])) {
              return false;
            }
          } else {
            if (item[key] !== query[key]) {
              return false;
            }
          }
        }
      }
      return true;
    };

    const filteredDatas = userdata.saved.filter(filterFunction);

    const filteredDataIds = filteredDatas.map((item) => item._id);
    const filteredData = await Place.find({
      _id: { $in: filteredDataIds },
    }).sort({ createdAt: -1 });

    const count = filteredData.length;
    const saveddata = filteredData.slice(skip, skip + ITEM_PER_PAGE);

    const pageCount = Math.ceil(count / ITEM_PER_PAGE);
    res.status(200).json({
      Pagination: {
        count,
        pageCount,
      },
      saveddata,
    });
  } catch (error) {
    console.error('Error in /savedplaces:', error);
    res.status(500).json({ error: 'Error fetching saved places' });
  }
});

module.exports = Router;
