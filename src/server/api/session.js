const Joi = require('@hapi/joi');

const MAX_LOGIN_ATTEMPTS = 3;

module.exports = (app) => {
  app.post('/session', async (req, res) => {
    const schema = Joi.object().keys({
      username: Joi.string().lowercase().required(),
      password: Joi.string().required(),
    });
    try {
      const data = await schema.validateAsync(req.body);
      const user = await app.models.User.findOne({ username: data.username });
      if (!user) {
        res.status(401).send({
          error:
            'Unauthorized, username incorrect/not found. Please try again or register.',
        });
      } else if (user.deactivate) {
        res.status(401).send({
          error: 'Unauthorized, account deactivated. Please register.',
        });
      } else if (user.isLocked) {
        user.incLoginAttempts(() => {
          res.status(401).send({
            error:
              'Unauthorized, maximum login attempts exceeded. Please come back after 1 hour or reset password.',
          });
        });
      } else if (user.authenticate(data.password)) {
        req.session.regenerate(() => {
          req.session.user = user;
          console.log(`Session.login success: ${req.session.user.username}`);
          if (!user.loginAttempts && !user.lockUntil) {
            const updates = {
              $set: { loginAttempts: 0 },
              $unset: { lockUntil: 1 },
            };
            user.update(updates, () => user);
          }
          res.status(200).send({
            username: user.username,
            email: user.email,
            date: user.date,
            image: user.image,
          });
        });
      } else {
        console.log('Session.login failed. Incorrect credentials.');
        user.incLoginAttempts(() => {
          res.status(401).send({
            error: `Unauthorized, password incorrect. Maximum number of login attempts is ${MAX_LOGIN_ATTEMPTS}.`,
          });
        });
      }
    } catch (err) {
      const { message } = err.details[0];
      console.log(`Session.login validation failure: ${message}`);
      res.status(400).send({ error: message });
    }
  });

  app.delete('/session', (req, res) => {
    if (req.session.user) {
      req.session.destroy(() => {
        res.status(204).end();
      });
    } else {
      res.status(200).end();
    }
  });
};
