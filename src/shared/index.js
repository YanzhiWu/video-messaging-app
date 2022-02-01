const validUsername = (username) => {
  if (!username || username.length <= 2 || username.length >= 16) {
    return { error: 'Username length must > 2 characters and < 16 characters' };
  }
  if (!username.match(/^[a-z0-9]+$/i)) {
    return { error: 'Username must be alphanumeric' };
  }
  return undefined;
};

const validPassword = (password) => {
  if (!password || password.length < 8) {
    return { error: 'Password length must be at least 8 characters' };
  }
  if (!password.match(/[0-9]/i)) {
    return { error: 'Password must contain a number' };
  }
  if (!password.match(/[a-z]/)) {
    return { error: 'Password must contain a lowercase letter' };
  }
  if (!password.match(/[A-Z]/)) {
    return { error: 'Password must contain an uppercase letter' };
  }
  if (!password.match(/\@|\!|\#|\$|\%|\^/i)) {
    return { error: 'Password must contain @, !, #, $, % or ^' };
  }
  return undefined;
};

module.exports = {
  validUsername,
  validPassword,
};
