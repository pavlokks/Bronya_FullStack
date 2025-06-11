require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.mongoURI;

const connectToMongo = () => {
  mongoose.set('strictQuery', true);
  mongoose.connect(String(mongoURI), () => {
    console.log('Сonnected to mongo');
  });
};

module.exports = connectToMongo;
