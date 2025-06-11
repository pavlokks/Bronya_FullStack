const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownername: String,
  ownerlast: String,
  img_path: String,
  title: { type: String, required: [true, 'Назва є обов’язковою'] },
  address: String,
  placetype: String,
  photos: {
    type: [String],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Потрібно додати принаймні одну фотографію',
    },
  },
  description: String,
  perks: [String],
  extraInfo: String,
  checkIn: Number,
  checkOut: Number,
  maxGuests: Number,
  price: Number,
  latitude: { type: Number, default: 25.45 },
  longitude: { type: Number, default: 81.84 },
  datecreated: Date,
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
