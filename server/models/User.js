const mongoose = require('mongoose');
const passportlocalmongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    unique: true,
    default: null,
  },
  phone: {
    type: String,
    unique: true,
    default: null,
  },
  pic: {
    type: String,
    default:
      'https://cdn.sortiraparis.com/images/80/98390/1014564-avatar-le-dernier-maitre-de-l-air-la-serie-netflix-en-live-action-devoile-sa-bande-annonce-finale.jpg',
  },
  password: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  saved: Array,
});

UserSchema.plugin(passportlocalmongoose);
UserSchema.plugin(findOrCreate);

UserSchema.methods.addsaveddata = async function (saves) {
  try {
    this.saved = this.saved.concat(saves);
    await this.save();
    return this.saved;
  } catch (error) {
    console.log(error + 'error at the time of saved addition');
  }
};

// const User = mongoose.model("users", UserSchema);
const User = mongoose.model('User', UserSchema);
module.exports = User;
