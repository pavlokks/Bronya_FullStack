require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');
const Router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const PassValidator = require('../models/Forgotpass');
const bcrypt = require('bcryptjs');
const Mailer = require('./Mailer');

// Змінна для тимчасового зберігання коду авторизації
let authCodeCheck;

// Маршрут для надсилання листа з кодом для скидання пароля
Router.post(
  '/',
  [body('email', 'Введіть правильну поштову скриньку.').isEmail()],
  async (req, res) => {
    // Перевірка валідності введених даних (електронна пошта)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
      // Пошук користувача за електронною поштою
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Користувач з такими даними не існує.',
        });
      }

      // Видалення попереднього коду скидання пароля, якщо він існує
      await PassValidator.findOneAndDelete({ email: req.body.email });

      // Генерація 6-значного коду авторизації
      const authCode = Math.floor(100000 + Math.random() * 900000);
      authCodeCheck = authCode;

      // Формування повідомлення для листа
      const msg = `Ви забули пароль? Використайте цей код, щоб скинути пароль:<br>[${authCode}]`;

      // Надсилання листа з кодом
      if (await Mailer(req.body.email, 'Скидання пароля', msg)) {
        try {
          // Збереження коду в базі даних
          await PassValidator.create({
            email: req.body.email,
            authcode: authCode,
          });
          res.json({ success: true, message: 'Лист надіслано' });
        } catch (error) {
          console.error('Saving code error:', error.message);
          res.status(500).json({ message: 'Виникла помилка', success: false });
        }
      } else {
        res.status(500).json({ message: 'Помилка надсилання листа', success: false });
      }
    } catch (error) {
      console.error('Processing request error:', error.message);
      res.status(500).json({ message: 'Виникла помилка', success: false });
    }
  },
);

// Маршрут для верифікації коду та оновлення пароля
Router.post(
  '/verify',
  [
    body('authcode', 'Введіть код (6 символів)').isLength({ min: 6 }),
    body('password', 'Введіть пароль (мінімум 8 символів)').isLength({ min: 8 }),
  ],
  async (req, res) => {
    // Перевірка валідності введених даних (код і пароль)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
      // Пошук збереженого коду авторизації за електронною поштою
      let storeAuthCode = await PassValidator.findOne({ email: req.body.email });

      if (!storeAuthCode) {
        return res.status(400).json({
          success: false,
          message: 'Користувача з такою поштою не знайдено',
        });
      }

      // Перевірка введеного коду авторизації
      if (storeAuthCode.authcode == req.body.authcode) {
        // Хешування нового пароля
        bcrypt.genSalt(10, async (error, salt) => {
          if (error) {
            console.error('Generation salt error:', error.message);
            return res.status(500).json({ message: 'Виникла помилка', success: false });
          }

          bcrypt.hash(req.body.password, salt, async (error, hashedPassword) => {
            if (error) {
              console.error('Hashing password error:', error.message);
              return res.status(500).json({ message: 'Виникла помилка', success: false });
            }

            try {
              // Формування повідомлення про успішне скидання пароля
              const sub = 'Ваш пароль скинуто';
              const msg = `Готово! Ваш пароль оновлено.<br>`;

              // Надсилання підтвердження
              await Mailer(req.body.email, sub, msg);

              // Оновлення пароля користувача в базі даних
              await User.updateOne({ email: req.body.email }, { password: hashedPassword });

              // Видалення використаного коду авторизації
              await PassValidator.deleteOne({ email: req.body.email });

              res.json({ success: true, message: 'Верифіковано' });
            } catch (error) {
              console.error('Updating password error:', error.message);
              res.status(500).json({ message: 'Виникла помилка', success: false });
            }
          });
        });
      } else {
        res.json({ success: false, message: 'Недійсний код' });
      }
    } catch (error) {
      console.error('Verifying error:', error.message);
      res.status(500).json({ message: 'Виникла помилка', success: false });
    }
  },
);

module.exports = Router;
