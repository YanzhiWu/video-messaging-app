const mongoose = require('mongoose');

const { Schema } = mongoose;

const Chatroom = new Schema({
  user1Name: { type: String },
  user1Id: { type: Schema.Types.ObjectId, ref: 'User' },
  user2Name: { type: String },
  user2Id: { type: Schema.Types.ObjectId, ref: 'User' },
  messages: { type: Array },
});

module.exports = mongoose.model('Chatroom', Chatroom);
