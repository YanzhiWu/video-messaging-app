const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment');

const { Schema } = mongoose;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 60 * 60 * 1000;

const makeSalt = () => `${Math.round(new Date().valueOf() * Math.random())}`;

const encryptPassword = (salt, password) =>
  crypto.createHmac('sha512', salt).update(password).digest('hex');

const reservedNames = ['password'];

const User = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  email: { type: String, required: true, index: { unique: true } },
  salt: { type: String, required: true },
  hash: { type: String, required: true },
  date: { type: String, default: moment().format() },
  image: { type: String },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
  deactivate: { type: Boolean, default: false },
  contacts: { type: Array },
  statuses: { type: Array },
  chatrooms: { type: Array },
  socketID: { type: String },
});

User.path('username').validate((value) => {
  if (!value) return false;
  if (reservedNames.indexOf(value) !== -1) return false;
  return (
    value.length >= 3 && value.length <= 15 && /^[a-zA-Z0-9]+$/i.test(value)
  );
}, 'Username is invalid.');

User.path('email').validate(
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  'Email address is invalid.',
);

User.virtual('password').set(function (password) {
  this.salt = makeSalt();
  this.hash = encryptPassword(this.salt, password);
});

User.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

User.method('authenticate', function (plainText) {
  return encryptPassword(this.salt, plainText) === this.hash;
});

User.method('incLoginAttempts', function (cb) {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update(
      {
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 },
      },
      cb,
    );
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.update(updates, cb);
});

User.pre('save', function (next) {
  const rand = Math.floor(Math.random() * Math.floor(10000));
  this.username = this.username.toLowerCase();
  this.email = this.email.toLowerCase();
  this.date = this.date.substring(0, 10);
  this.image = `https://gravatar.com/avatar/${rand}?d=identicon`;
  next();
});

module.exports = mongoose.model('User', User);
