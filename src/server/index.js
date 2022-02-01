const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');
const envConfig = require('simple-env-config');
const http = require('http');
const socketio = require('socket.io');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';

const setupServer = async () => {
  const conf = await envConfig('./config/config.json', env);
  const port = process.env.PORT ? process.env.PORT : conf.port;

  const io = socketio(server);

  if (env !== 'test') app.use(logger('dev'));
  app.engine('pug', require('pug').__express);
  app.set('views', __dirname);
  app.use(express.static(path.join(__dirname, '../../public')));

  app.store = session({
    name: 'session',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: '/',
    },
  });
  app.use(app.store);

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  try {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    await mongoose.connect(conf.mongodb);
    console.log('MongoDB connected...');
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }

  app.models = {
    User: require('./models/user'),
    Chatroom: require('./models/chatroom'),
    Message: require('./models/message'),
  };

  require('./api')(app);

  app.get('*', (req, res) => {
    const { user } = req.session;
    console.log(`Loading app for: ${user ? user.username : 'nobody!'}`);
    let preloadedState = user
      ? {
          username: user.username,
          email: user.email,
          date: user.date,
        }
      : {};
    preloadedState = JSON.stringify(preloadedState).replace(/</g, '\\u003c');
    res.render('base.pug', {
      state: preloadedState,
    });
  });

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'public');
    },
    filename(req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const upload = multer({ storage }).single('file');
  app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err);
      }
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).send(req.file);
    });
  });

  const Chatroom = mongoose.model('Chatroom');
  const Message = mongoose.model('Message');
  let onlineUsers = [];

  io.on('connection', (socket) => {
    console.log('WebSocket Connected...');

    socket.on('disconnect', () => {
      io.emit('WebSocket Disconnected...');
    });

    socket.on('joinRoom', ({ chatroomId, user }) => {
      socket.join(chatroomId);
      console.log(`${user} has joined chatroom ${chatroomId}`);
      onlineUsers.push(user);
      console.log(`Online users: ${onlineUsers}`);
    });

    socket.on('leaveRoom', ({ chatroomId, user }) => {
      socket.leave(chatroomId);
      console.log(`${user} has left chatroom ${chatroomId}`);
      onlineUsers = onlineUsers.filter((leftUser) => leftUser !== user);
      console.log(`Online users: ${onlineUsers}`);
    });

    socket.on('outgoing-call', ({ chatroomId, socketID, caller, receiver }) => {
      console.log('in og-call');
      if (socketID !== '') {
        console.log('receiver online');
        io.to(socketID).emit('incoming-call', { chatroomId, caller });
      } else if (onlineUsers.includes(receiver)) {
        console.log('receiver in chatroom');
        io.to(chatroomId).emit('incoming-call', { chatroomId, caller });
      } else {
        console.log('receiver offline');
        io.to(chatroomId).emit('receiver-offline', caller);
      }
    });

    socket.on('accept-call', ({ chatroomId, caller }) => {
      io.to(chatroomId).emit('call-accepted', { chatroomId, caller });
    });

    socket.on('decline-call', ({ chatroomId, caller }) => {
      io.to(chatroomId).emit('call-declined', caller);
    });

    socket.on('norespond-call', ({ chatroomId, caller }) => {
      io.to(chatroomId).emit('call-noresponse', caller);
    });

    socket.on('changeRoomMessages', async ({ chatroomId, msgs }) => {
      await Chatroom.findOneAndUpdate({ _id: chatroomId }, { messages: msgs });
      io.to(chatroomId).emit('changedMessages', msgs);
    });

    socket.on('chatMessage', async (msg) => {
      const newMessage = new Message({
        sender: msg.sender,
        receiver: msg.receiver,
        senderImage: msg.senderImage,
        date: msg.date,
        chatroomId: msg.chatroomId,
        message: msg.message,
        type: msg.type,
      });
      await newMessage.save();
      io.to(msg.chatroomId).emit('newMessage', {
        sender: msg.sender,
        receiver: msg.receiver,
        senderImage: msg.senderImage,
        date: msg.date,
        chatroomId: msg.chatroomId,
        message: msg.message,
        type: msg.type,
      });

      const room = await Chatroom.findOne({ _id: msg.chatroomId });
      await Chatroom.findOneAndUpdate(
        { _id: msg.chatroomId },
        {
          messages: room.messages.concat({
            sender: msg.sender,
            receiver: msg.receiver,
            senderImage: msg.senderImage,
            date: msg.date,
            chatroomId: msg.chatroomId,
            message: msg.message,
            type: msg.type,
            messageId: newMessage._id,
          }),
        },
      );
    });
  });

  server.listen(port, () => {
    console.log(`Server listening on port ${server.address().port}...`);
  });
};

setupServer();

module.exports = server;
