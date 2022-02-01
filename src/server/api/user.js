const Joi = require('@hapi/joi');
const crypto = require('crypto');
const { validPassword } = require('../../shared');

module.exports = (app) => {
  app.post('/user', async (req, res) => {
    let data;
    try {
      const schema = Joi.object().keys({
        username: Joi.string().lowercase().alphanum().min(3).max(15).required(),
        email: Joi.string().lowercase().email().required(),
        password: Joi.string().min(8).required(),
      });
      data = await schema.validateAsync(req.body);
    } catch (err) {
      const { message } = err.details[0];
      console.log(`User.create validation failure: ${message}`);
      return res.status(400).send({ error: message });
    }

    const pwdErr = validPassword(data.password);
    if (pwdErr) {
      console.log(`User.create password validation failure: ${pwdErr.error}`);
      return res.status(400).send(pwdErr);
    }

    try {
      const user = new app.models.User(data);
      await user.save();
      res.status(201).send({
        username: data.username,
        email: data.email,
        date: data.date,
      });
    } catch (err) {
      if (err.code === 11000) {
        if (err.message.indexOf('username_1') !== -1) {
          res.status(400).send({ error: 'Username already in use' });
        }
        if (err.message.indexOf('email_1') !== -1) {
          res.status(400).send({ error: 'Email address already in use' });
        }
      } else {
        res.status(400).send({ error: 'Invalid username' });
      }
    }
  });

  app.head('/user/:username', async (req, res) => {
    const user = await app.models.User.findOne({
      username: req.params.username.toLowerCase(),
    });
    if (!user) {
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    } else res.status(200).end();
  });

  app.get('/user/:username', async (req, res) => {
    const user = await app.models.User.findOne({
      username: req.params.username.toLowerCase(),
    });
    if (!user) {
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    } else {
      res.status(200).send({
        username: user.username,
        email: user.email,
        date: user.date,
        image: user.image,
      });
    }
  });

  app.put('/reset', async (req, res) => {
    let data;
    try {
      data = await req.body;
      const pwdErr = validPassword(data.password);
      if (pwdErr) {
        console.log(`User.create password validation failure: ${pwdErr.error}`);
        return res.status(400).send(pwdErr);
      }
      const user = await app.models.User.findOne({
        $and: [
          { username: data.username.toLowerCase() },
          { email: data.email.toLowerCase() },
        ],
      });
      if (!user) {
        res.status(401).send({
          error:
            'Unauthorized, invalid username/email/username email combination. Please try again or register.',
        });
      }
    } catch (err) {
      const { message } = err.details[0];
      console.log(`User.update validation failure: ${message}`);
      return res.status(400).send({ error: message });
    }

    try {
      const user = await app.models.User.findOne({ username: data.username });
      const newSalt = `${Math.round(new Date().valueOf() * Math.random())}`;
      const newHash = crypto
        .createHmac('sha512', newSalt)
        .update(data.password)
        .digest('hex');
      const updatePassword = {
        $set: { salt: newSalt, hash: newHash },
      };
      user.update(updatePassword, () => user);
      const updateLockInfo = {
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
      };
      user.update(updateLockInfo, () => user);
      res.status(200).end();
    } catch (err) {
      res.status(500).end();
    }
  });

  app.put('/deactivate/:username', async (req, res) => {
    try {
      const user = await app.models.User.findOne({
        username: req.params.username.toLowerCase(),
      });
      const updateDeactivate = {
        $set: { deactivate: true },
      };
      user.update(updateDeactivate, () => user);
      res.status(200).end();
    } catch (err) {
      res.status(500).end();
    }
  });

  app.get('/contacts/:username', async (req, res) => {
    const user = await app.models.User.findOne({
      username: req.params.username.toLowerCase(),
    });
    if (!user) {
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    } else {
      res.status(200).send({
        contacts: user.contacts,
      });
    }
  });

  app.put('/addcontact/:username', async (req, res) => {
    if (req.params.username === req.body.contactname) {
      res.status(404).send({ error: 'You cannot add yourself to contact' });
      return;
    }
    const user = await app.models.User.findOne({
      username: req.params.username,
    });
    if (!user) {
      res.status(404).send({ error: `Unknown user: ${req.params.username}` });
      return;
    }
    console.log('user found');
    if (!req.body.contactname) {
      res.status(404).send({
        error: 'Please enter a username',
      });
      return;
    }
    console.log('contact name exists');
    const contact = await app.models.User.findOne({
      username: req.body.contactname,
    });
    if (!contact) {
      res
        .status(404)
        .send({ error: `User '${req.body.contactname}' does not exist` });
      return;
    }
    if (contact.deactivate) {
      res.status(404).send({
        error: `User '${req.body.contactname}' has been deactivated`,
      });
      return;
    }
    console.log('contact found');
    const found = user.contacts.find(
      (element) => element.contactname === req.body.contactname,
    );
    if (found !== undefined) {
      res.status(404).send({
        error: `User '${req.body.contactname}' is already in your contacts`,
      });
      return;
    }
    console.log('contact is new');
    await app.models.User.findOneAndUpdate(
      { username: req.params.username },
      {
        contacts: user.contacts.concat({
          contactname: req.body.contactname,
          contactimage: contact.image,
        }),
      },
    );
    console.log('contact added for user');
    await app.models.User.findOneAndUpdate(
      { username: req.body.contactname },
      {
        contacts: contact.contacts.concat({
          contactname: req.params.username,
          contactimage: user.image,
        }),
      },
    );
    console.log('user added for contact');
    res.status(200).send({
      contacts: user.contacts.concat({
        contactname: req.body.contactname,
        contactimage: contact.image,
      }),
    });
  });

  app.put('/deletecontact/:username', async (req, res) => {
    let newUserContacts = [];
    let newContactContacts = [];
    let i;
    let j;
    const user = await app.models.User.findOne({
      username: req.params.username,
    });
    const contact = await app.models.User.findOne({
      username: req.body.contactname,
    });
    if (!contact) {
      res
        .status(404)
        .send({ error: `User ${req.body.contactname} does not exist` });
      return;
    }
    console.log('contact found');
    for (i = 0; i < user.contacts.length; i++) {
      if (user.contacts[i].contactname !== req.body.contactname) {
        newUserContacts = newUserContacts.concat(user.contacts[i]);
      }
    }
    for (j = 0; j < contact.contacts.length; j++) {
      if (contact.contacts[j].contactname !== req.params.username) {
        newContactContacts = newContactContacts.concat(contact.contacts[j]);
      }
    }
    await app.models.User.findOneAndUpdate(
      { username: req.params.username },
      {
        contacts: newUserContacts,
      },
    );
    console.log('contact deleted for user');
    await app.models.User.findOneAndUpdate(
      { username: req.body.contactname },
      {
        contacts: newContactContacts,
      },
    );
    console.log('user deleted for contact');
    res.status(200).send({
      contacts: newUserContacts,
    });
  });

  app.get('/statuses/:username', async (req, res) => {
    const user = await app.models.User.findOne({
      username: req.params.username.toLowerCase(),
    });
    if (!user) {
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    } else {
      const newarray = user.statuses.slice().reverse();
      res.status(200).send({
        statuses: newarray,
      });
    }
  });

  app.put('/addstatus/:username', async (req, res) => {
    try {
      const user = await app.models.User.findOne({
        username: req.params.username.toLowerCase(),
      });
      await app.models.User.findOneAndUpdate(
        { username: req.params.username },
        {
          statuses: user.statuses.concat({
            user: req.params.username,
            userImage: user.image,
            status: req.body.status,
            gifImage: req.body.gifImage,
          }),
        },
      );
      user.contacts.forEach(async (contactUser) => {
        const contact = await app.models.User.findOne({
          username: contactUser.contactname,
        });
        const contactNewStatuses = contact.statuses;
        await app.models.User.findOneAndUpdate(
          { username: contactUser.contactname },
          {
            statuses: contactNewStatuses.concat({
              user: req.params.username,
              userImage: user.image,
              status: req.body.status,
              gifImage: req.body.gifImage,
            }),
          },
        );
      });
      res.status(200).end();
    } catch (err) {
      res.status(500).end();
    }
  });

  app.get('/getsocketid/:username', async (req, res) => {
    const user = await app.models.User.findOne({
      username: req.params.username,
    });
    if (!user) {
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    } else {
      res.status(200).send({
        socketID: user.socketID,
      });
    }
  });

  app.put('/setsocketid/:username', async (req, res) => {
    try {
      const user = await app.models.User.findOne({
        username: req.params.username,
      });
      if (!user) {
        res.status(404).send({ error: `Unknown user: ${req.params.username}` });
        return;
      }
      console.log('user found');
      await app.models.User.findOneAndUpdate(
        { username: req.params.username },
        {
          socketID: req.body.socketID,
        },
      );
      console.log(`done setting socketID for ${req.params.username}`);
      res.status(200).end();
    } catch (err) {
      res.status(500).end();
    }
  });
};
