const express = require('express');
const asyncHandler = require('express-async-handler');
const fetchUser = require('../middleware/fetchUserFromToken.js');
const Chat = require('../models/ChatModel.js');
const Message = require('../models/MessageModel');
const User = require('../models/User');
const Router = express.Router();

// Пошук користувачів для чату
Router.get(
  '/user',
  fetchUser,
  asyncHandler(async (req, res) => {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
            { phone: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.userId } })
      .select('username pic email phone');
    res.send(users);
  }),
);

// Доступ або створення індивідуального чату
Router.post(
  '/',
  fetchUser,
  asyncHandler(async (req, res) => {
    const { guestuserId } = req.body;

    if (!guestuserId) {
      return res.status(400).json({ message: 'Параметр userId не надіслано з запитом' });
    }

    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.userId } } },
        { users: { $elemMatch: { $eq: guestuserId } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'username pic email phone',
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: 'відправник',
        isGroupChat: false,
        users: [req.userId, guestuserId],
      };

      try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          'users',
          '-password',
        );
        res.status(200).json(fullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  }),
);

// Отримання всіх чатів для користувача
Router.get(
  '/',
  fetchUser,
  asyncHandler(async (req, res) => {
    try {
      let chats = await Chat.find({ users: { $elemMatch: { $eq: req.userId } } })
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .populate('latestMessage')
        .sort({ updatedAt: -1 });

      chats = await User.populate(chats, {
        path: 'latestMessage.sender',
        select: 'username pic email phone',
      });
      res.status(200).send(chats);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }),
);

// Створення групового чату
Router.post(
  '/group',
  fetchUser,
  asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: 'Будь ласка, заповніть усі поля' });
    }

    const users = JSON.parse(req.body.users);
    if (users.length < 2) {
      return res.status(400).send('Для створення групового чату потрібно більше 2 користувачів');
    }

    users.push(req.userId);

    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.userId,
      });

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }),
);

// Перейменування групового чату
Router.put(
  '/rename',
  fetchUser,
  asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      res.status(404);
      throw new Error('Чат не знайдено');
    }
    res.json(updatedChat);
  }),
);

// Видалення користувача з групи
Router.put(
  '/removefromgroup',
  fetchUser,
  asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true },
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!removed) {
      res.status(404);
      throw new Error('Чат не знайдено');
    }
    res.json(removed);
  }),
);

// Додавання користувача до групи
Router.put(
  '/addtogroup',
  fetchUser,
  asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!added) {
      res.status(404);
      throw new Error('Чат не знайдено');
    }
    res.json(added);
  }),
);

// Отримання всіх повідомлень для чату
Router.get(
  '/message/:chatId',
  fetchUser,
  asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate('sender', 'username pic email phone')
        .populate({
          path: 'chat',
          populate: { path: 'users', select: 'username pic email' },
        });
      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }),
);

// Надсилання повідомлення
Router.post(
  '/message',
  fetchUser,
  asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({ message: 'Недійсні дані передано в запиті' });
    }

    const newMessage = {
      sender: req.userId,
      content: content,
      chat: chatId,
    };

    try {
      let message = await Message.create(newMessage);

      message = await message.populate('sender', 'username pic email phone');
      message = await message.populate({
        path: 'chat',
        populate: { path: 'users', select: 'username pic email _id' },
      });

      await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

      console.log('Message created:', message);
      res.json(message);
    } catch (error) {
      console.error('Failed message sending:', error);
      res.status(400);
      throw new Error(error.message);
    }
  }),
);

module.exports = Router;
