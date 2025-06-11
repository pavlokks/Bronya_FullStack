require('dotenv').config();
const express = require('express');
const moment = require('moment-timezone');
const multer = require('multer');
const User = require('../models/User.js');
const Place = require('../models/Place.js');
const Booking = require('../models/Booking.js');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fetchUser = require('../middleware/fetchUserFromToken');
const fs = require('fs').promises;

const Router = express.Router();

// Налаштування Multer для завантаження зображень
const photosMiddleware = multer({
  dest: path.join(__dirname, 'temp-images'),
  limits: { fileSize: 1024 * 1024 * 10 }, // Обмеження розміру файлу до 10 МБ
});

// Маршрут для завантаження зображень через файли
Router.post('/upload-by-file', photosMiddleware.array('photos', 100), async (req, res) => {
  try {
    const uploadedFiles = [];

    // Перебір усіх завантажених файлів і їх збереження в Cloudinary
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const result = await cloudinary.uploader.upload(file.path, {
        public_id: file.originalname,
        resource_type: 'image',
        folder: 'temp-images',
      });

      uploadedFiles.push(result.secure_url);
      // Видалення локального файлу після завантаження
      await fs.unlink(file.path);
    }

    res.json(uploadedFiles); // Повернення масиву URL завантажених зображень
  } catch (error) {
    console.error('Uploading image error:', error);
    res.status(500).json({ error: 'Не вдалося завантажити зображення.' });
  }
});

// Маршрут для створення нового оголошення про житло
Router.post('/upload', fetchUser, async (req, res) => {
  try {
    // Отримання даних користувача за ID
    const user = await User.findById(req.userId);
    const {
      title,
      address,
      placetype,
      addedPhotos,
      description,
      price,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      latitude,
      longitude,
    } = req.body;

    // Перевірка, чи вказано назву
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Назва є обов’язковою.' });
    }

    // Перевірка, чи додано хоча б одну фотографію
    if (!addedPhotos || addedPhotos.length === 0) {
      return res.status(400).json({ error: 'Потрібно додати принаймні одну фотографію.' });
    }

    // Форматування дати створення за київським часом
    const datecreated = moment.tz(new Date(), 'Europe/Kyiv').format('YYYY-MM-DD HH:mm:ss');

    // Створення нового об’єкта житла
    const place = new Place({
      title,
      address,
      placetype,
      photos: addedPhotos,
      description,
      price,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      latitude,
      longitude,
      datecreated,
      owner: user._id,
      ownername: user.firstName,
      ownerlast: user.lastName,
    });

    await place.save(); // Збереження житла в базі даних

    res.send('Житло успішно створено.');
  } catch (error) {
    console.error('Creating room error:', error);
    res
      .status(400)
      .json({ error: error.message || 'Помилка під час створення житла. Спробуйте ще раз.' });
  }
});

// Маршрут для видалення оголошення про житло за ID
Router.delete('/deleteplace/:id', async (req, res) => {
  try {
    const placeId = req.params.id;
    // Пошук житла за ID
    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ message: 'Житло не знайдено' });
    }

    // Видалення всіх бронювань, пов’язаних із житлом
    await Booking.deleteMany({ place: placeId });

    // Видалення фотографій із Cloudinary
    const imagePaths = place.photos;
    for (const imagePath of imagePaths) {
      await cloudinary.uploader.destroy(imagePath);
    }

    // Видалення житла з бази даних
    await Place.findByIdAndDelete(placeId);

    res.json({ success: true, message: 'Житло та пов’язані бронювання успішно видалено' });
  } catch (error) {
    console.error('Deleting room error:', error);
    res.status(500).json({ message: 'Не вдалося видалити житло' });
  }
});

// Маршрут для оновлення оголошення про житло
Router.put('/update', fetchUser, async (req, res) => {
  try {
    // Отримання даних користувача за ID
    const user = await User.findById(req.userId);
    const {
      id,
      title,
      address,
      placetype,
      addedPhotos,
      description,
      price,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      latitude,
      longitude,
    } = req.body;

    // Перевірка, чи вказано назву
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Назва є обов’язковою.' });
    }

    // Перевірка, чи додано хоча б одну фотографію
    if (!addedPhotos || addedPhotos.length === 0) {
      return res.status(400).json({ error: 'Потрібно додати принаймні одну фотографію.' });
    }

    // Пошук житла за ID
    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({ message: 'Житло не знайдено' });
    }

    // Оновлення даних житла
    place.title = title;
    place.address = address;
    place.placetype = placetype;
    place.photos = addedPhotos;
    place.description = description;
    place.price = price;
    place.perks = perks;
    place.extraInfo = extraInfo;
    place.checkIn = checkIn;
    place.checkOut = checkOut;
    place.maxGuests = maxGuests;
    place.latitude = latitude;
    place.longitude = longitude;
    place.owner = user._id;
    place.ownername = user.firstName;
    place.ownerlast = user.lastName;

    await place.save(); // Збереження оновленого житла

    res.send(place);
  } catch (error) {
    console.error('Updating room error:', error);
    res
      .status(400)
      .json({ error: error.message || 'Помилка під час оновлення житла. Спробуйте ще раз.' });
  }
});

// Маршрут для отримання всіх оголошень користувача
Router.get('/user-places', fetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    // Пошук усіх оголошень, де власником є поточний користувач
    const places = await Place.find({ owner: userId }).sort({ createdAt: -1 });
    res.send(places);
  } catch (error) {
    console.error('Receving rooms error:', error);
    res.status(400).send('Помилка під час отримання списку житла. Спробуйте ще раз.');
  }
});

// Маршрут для отримання всіх бронювань користувача
Router.get('/bookedhosting', fetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    // Пошук усіх бронювань, де власником є поточний користувач
    const bookedhostings = await Booking.find({ owner: userId })
      .populate('place')
      .sort({ createdAt: -1 });
    res.send(bookedhostings);
  } catch (error) {
    console.error('Error receving bookings:', error);
    res.status(400).send('Помилка під час отримання списку бронювань. Спробуйте ще раз.');
  }
});

// Маршрут для скасування бронювання
Router.delete('/cancelbookedhosting/:id', fetchUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Пошук бронювання за ID
    const bookings = await Booking.findById(id);
    if (!bookings) {
      return res.status(404).json({ message: 'Бронювання не знайдено' });
    }

    // Пошук житла, пов’язаного з бронюванням
    const placeDoc = await Place.findOne({ _id: bookings.place });

    if (!placeDoc) {
      return res.status(404).json({ error: 'Житло не знайдено.' });
    }

    // Видалення бронювання
    await Booking.findByIdAndDelete(id);

    // Оновлення статусу житла (зняття позначки "заброньовано")
    await Place.updateOne({ _id: placeDoc._id }, { $set: { isbooked: false } });

    res.json({
      success: true,
      message: 'Бронювання успішно скасовано',
    });
  } catch (error) {
    console.error('Cancelling booking error:', error);
    res.status(400).json({ error: 'Помилка під час скасування бронювання' });
  }
});

module.exports = Router;
