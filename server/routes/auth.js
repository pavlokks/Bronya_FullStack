require('dotenv').config();
const express = require('express');
const Router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const fetchUser = require('../middleware/fetchUserFromToken');
const PassValidator = require('../models/Forgotpass');
const Mailer = require('./Mailer');

// Верифікація email для реєстрації
Router.post(
  '/signup/email/verify',
  [
    body('email', 'Введіть валідну email-адресу').isEmail(),
    body('password', 'Пароль не може бути порожнім').exists(),
    body('password', 'Пароль має бути мінімум 8 символів').isLength({ min: 8 }),
    body('phone', 'Введіть валідний номер телефону (10 цифр)').isLength({ min: 10, max: 10 }),
    body('fname', 'Ім’я має бути мінімум 3 символи').isLength({ min: 3 }),
    body('lname', 'Прізвище має бути мінімум 3 символи').isLength({ min: 3 }),
    body('authcode', 'Введіть 6-значний код верифікації').isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
      // Перевірка, чи існує користувач
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'Користувач із такою email-адресою вже існує. Увійдіть.',
        });
      }

      // Перевірка коду верифікації
      let storeAuthCode = await PassValidator.findOne({ email: req.body.email });
      if (!storeAuthCode) {
        return res
          .status(400)
          .json({ success: false, message: 'Немає запиту на створення акаунта для цього email.' });
      }

      // Порівняння кодів як рядків
      if (storeAuthCode.authcode.toString() !== req.body.authcode.toString()) {
        return res.status(400).json({ success: false, message: 'Неправильний код верифікації.' });
      }

      // Хешування пароля
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Створення користувача
      const fullname = `${req.body.fname} ${req.body.lname}`;
      user = await User.create({
        firstName: req.body.fname,
        lastName: req.body.lname,
        email: req.body.email,
        username: fullname,
        phone: req.body.phone,
        password: hashedPassword,
      });

      // Генерація JWT
      const data = { user: { user: user.id } };
      const authToken = jwt.sign(data, JWT_SECRET);

      // Відправка привітального email
      const msg = `Шановний(а) ${fullname},<br>
        Дякуємо, що обрали нас.<br><br>`;
      const sub = 'Ласкаво просимо до BRONYA!';
      const mailSent = await Mailer(req.body.email, sub, msg);

      if (!mailSent) {
        console.error('Email sending error.');
      }

      res.status(200).json({ success: true, authToken, message: 'Верифіковано' });

      // Видалення коду верифікації після успішної реєстрації
      await PassValidator.deleteOne({ email: req.body.email });
    } catch (error) {
      console.error('Verifying error:', error.stack);
      res.status(500).json({ success: false, message: 'Помилка сервера. Спробуйте ще раз.' });
    }
  },
);

// Відправка OTP для верифікації email
Router.post(
  '/signup/email',
  [body('email', 'Введіть валідну email-адресу').isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success: false, message: 'Користувач із такою email-адресою вже існує.' });
      }

      // Видалення старого коду, якщо є
      await PassValidator.findOneAndDelete({ email: req.body.email });

      // Генерація OTP
      const authCode = Math.floor(100000 + Math.random() * 900000);
      const msg = `Дякуємо за вибір BRONYA. Код для верифікації вашого акаунта:<br>
        <b>${authCode}</b><br>`;
      const mailSent = await Mailer(req.body.email, 'Ваш код верифікації', msg);

      if (mailSent) {
        await PassValidator.create({
          email: req.body.email,
          authcode: authCode,
        });
        res.json({ success: true, message: 'Email відправлено' });
      } else {
        res.status(500).json({ success: false, message: 'Помилка відправки email.' });
      }
    } catch (error) {
      console.error('OTP sending error:', error.stack);
      res.status(500).json({ success: false, message: 'Помилка сервера. Спробуйте ще раз.' });
    }
  },
);

// Аутентифікація при вході
Router.post(
  '/signin',
  [
    body('email', 'Введіть валідну email-адресу').isEmail(),
    body('password', 'Пароль не може бути порожнім').exists(),
    body('password', 'Пароль має бути мінімум 8 символів').isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: 'Користувача з такою email-адресою не існує.' });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Невірний email або пароль.' });
      }

      const payload = { user: { user: user.id } };
      const authToken = jwt.sign(payload, JWT_SECRET);

      res.json({
        success: true,
        authToken,
        _id: user._id,
        username: user.username,
        email: user.email,
        pic: user.pic,
        message: 'Верифіковано',
      });
    } catch (error) {
      console.error('Authorization error:', error.stack);
      res.status(500).json({ success: false, message: 'Помилка сервера. Спробуйте ще раз.' });
    }
  },
);

// Верифікація токена
Router.post('/verifyuser', fetchUser, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('firstName lastName email phone');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Авторизуйтесь за допомогою валідного токена.' });
    }
    if (!user.phone) {
      console.log(`No phone number for user ${userId}`);
    }
    res.json({ success: true, message: 'Верифіковано', data: user });
  } catch (error) {
    console.error('Verifing token error:', error.stack);
    res.status(500).json({ success: false, message: 'Помилка сервера. Спробуйте ще раз.' });
  }
});

// Видалення акаунта
Router.post(
  '/delete/email',
  [body('email', 'Введіть валідну email-адресу').isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: 'Користувача з такою email-адресою не існує.' });
      }

      await PassValidator.findOneAndDelete({ email: req.body.email });

      const authCode = Math.floor(100000 + Math.random() * 900000);
      const mailSent = await Mailer(
        req.body.email,
        'Код для видалення акаунта',
        `Ваш код верифікації: ${authCode}`,
      );

      if (mailSent) {
        await PassValidator.create({
          email: req.body.email,
          authcode: authCode,
        });
        res.json({ success: true, message: 'Email відправлено' });
      } else {
        res.status(500).json({ success: false, message: 'Помилка відправки email.' });
      }
    } catch (error) {
      console.error('Request sending error:', error.stack);
      res.status(500).json({ success: false, message: 'Помилка сервера. Спробуйте ще раз.' });
    }
  },
);

// Верифікація для видалення акаунта
Router.post(
  '/delete/email/verify',
  [
    body('email', 'Введіть валідну email-адресу').isEmail(),
    body('password', 'Пароль не може бути порожнім').exists(),
    body('password', 'Пароль має бути мінімум 8 символів').isLength({ min: 8 }),
    body('authcode', 'Введіть 6-значний код верифікації').isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: 'Користувача з такою email-адресою не існує.' });
      }

      let storeAuthCode = await PassValidator.findOne({ email: req.body.email });
      if (!storeAuthCode) {
        return res
          .status(400)
          .json({ success: false, message: 'Немає запиту на видалення акаунта для цього email.' });
      }

      if (storeAuthCode.authcode.toString() !== req.body.authcode.toString()) {
        return res.status(400).json({ success: false, message: 'Неправильний код верифікації.' });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Невірний email або пароль.' });
      }

      await User.deleteOne({ email: req.body.email });

      const date = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
      const msg = `Вітаємо, ${user.username},<br><br>Ваш акаунт було видалено ${date}.<br><br>З повагою,<br>Команда BRONYA`;
      await Mailer(req.body.email, 'Акаунт видалено', msg);

      res.json({ success: true, message: 'Акаунт успішно видалено' });
    } catch (error) {
      console.error('Deleting account error:', error.stack);
      res.status(500).json({ success: false, message: 'Помилка сервера. Спробуйте ще раз.' });
    }
  },
);

module.exports = Router;
