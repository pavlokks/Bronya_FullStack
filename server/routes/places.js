const express = require('express');
const Place = require('../models/Place.js');

const Router = express.Router();

// Отримання списку місць з пагінацією та фільтрацією
Router.get('/', async (req, res) => {
  const page = req.query.page || 1; // Номер сторінки
  const ITEM_PER_PAGE = req.query.size || 6; // Кількість елементів на сторінці
  const { address, placetype, sort } = req.query; // Параметри фільтрації та сортування

  try {
    const skip = (page - 1) * ITEM_PER_PAGE;

    // Формування запиту для фільтрації
    const query = {
      ...(address && { address: { $regex: address, $options: 'i' } }),
      ...(placetype && { placetype: { $regex: placetype, $options: 'i' } }),
    };

    // Налаштування сортування
    let sortOptions = {};
    if (sort === 'new' || sort === 'old') {
      sortOptions.datecreated = sort === 'new' ? -1 : 1;
    } else {
      sortOptions.price = sort === 'decprice' ? -1 : 1;
    }

    // Підрахунок загальної кількості документів
    const count = await Place.countDocuments(query);
    // Отримання даних з пагінацією та сортуванням
    const placesdata = await Place.find(query).sort(sortOptions).limit(ITEM_PER_PAGE).skip(skip);

    const pageCount = Math.ceil(count / ITEM_PER_PAGE); // Кількість сторінок

    res.status(200).json({
      Pagination: {
        count,
        pageCount,
      },
      placesdata,
    });
  } catch (error) {
    res.status(500).json({ message: 'Виникли помилки', success: false });
  }
});

// Отримання всіх опублікованих місць
Router.get('/allplaces', async (req, res) => {
  try {
    const places = await Place.find();

    if (!places) {
      return res.status(404).json({ message: 'Місця не знайдено' });
    }
    res.send(places);
  } catch (error) {
    res.status(400).send('Помилка під час отримання місць. Спробуйте ще раз.');
  }
});

// Отримання деталей конкретного місця за ID
Router.get('/:id', async (req, res) => {
  try {
    const placeId = req.params.id;
    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ message: 'Місце не знайдено' });
    }
    res.send(place);
  } catch (error) {
    res.status(400).send('Помилка під час отримання місця. Спробуйте ще раз.');
  }
});

module.exports = Router;
