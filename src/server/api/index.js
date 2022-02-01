module.exports = (app) => {
  require('./user')(app);
  require('./session')(app);
  require('./chatroom')(app);
};
