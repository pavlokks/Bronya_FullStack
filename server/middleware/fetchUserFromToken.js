require('dotenv').config();
const jwt = require('jsonwebtoken');

// Отримання користувача з JWT-токена та додавання його ID до об'єкта запиту
const fetchUser = async (req, res, next) => {
  // Отримання токена з заголовка запиту
  const token = req.header('token');
  if (!token) {
    return res
      .status(401)
      .send({ error: 'Будь ласка, автентифікуйтесь за допомогою дійсного токена' });
  }

  try {
    // Перевірка та декодування токена
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data.user.user;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Будь ласка, автентифікуйтесь за допомогою дійсного токена' });
  }
};

module.exports = fetchUser;
