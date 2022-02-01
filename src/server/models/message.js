const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const Message = new Schema({
  sender: { type: String },
  receiver: { type: String },
  senderImage: { type: String },
  date: { type: String, default: moment().format('MMMM Do YYYY, h:mm:ss a') },
  chatroomId: { type: Schema.Types.ObjectId, ref: 'Chatroom' },
  message: { type: String },
  type: { type: String },
});

module.exports = mongoose.model('Message', Message);
