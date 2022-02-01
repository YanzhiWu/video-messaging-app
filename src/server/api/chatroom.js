module.exports = (app) => {
  app.post('/chatroom', async (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      try {
        const user1 = await app.models.User.findOne({
          username: req.body.user1,
        });
        const user2 = await app.models.User.findOne({
          username: req.body.user2,
        });
        const newChatroom = {
          user1Name: req.body.user1,
          user1Id: user1._id,
          user2Name: req.body.user2,
          user2Id: user2._id,
        };
        const room = new app.models.Chatroom(newChatroom);
        await room.save();
        if (user2.deactivate) {
          res.status(404).send({
            error: `User '${req.body.user2}' has been deactivated`,
          });
          return;
        }
        await app.models.User.findOneAndUpdate(
          { username: req.body.user1 },
          {
            chatrooms: user1.chatrooms.concat({
              chatroomId: room._id,
              contactName: req.body.user2,
            }),
          },
        );
        await app.models.User.findOneAndUpdate(
          { username: req.body.user2 },
          {
            chatrooms: user2.chatrooms.concat({
              chatroomId: room._id,
              contactName: req.body.user1,
            }),
          },
        );
        const { contacts } = user1;
        contacts.some(
          (item, idx) =>
            item.contactname === req.body.user2 &&
            contacts.unshift(contacts.splice(idx, 1)[0]),
        );
        await app.models.User.findOneAndUpdate(
          { username: req.body.user1 },
          { contacts },
        );
        res.status(201).send({ id: room._id });
      } catch (err) {
        console.log(`Room.create save failure: ${err}`);
        res.status(400).send({ error: 'failure creating room' });
      }
    }
  });

  app.get('/chatroom/:username/:contactname', async (req, res) => {
    const user = await app.models.User.findOne({
      username: req.params.username.toLowerCase(),
    });
    const user2 = await app.models.User.findOne({
      username: req.params.contactname.toLowerCase(),
    });
    if (user2.deactivate) {
      res.status(404).send({
        error: `User '${req.params.contactname}' has been deactivated`,
      });
      return;
    }
    if (!user) {
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    } else {
      const found = user.chatrooms.find(
        (element) => element.contactName === req.params.contactname,
      );
      if (found !== undefined) {
        const { contacts } = user;
        contacts.some(
          (item, idx) =>
            item.contactname === req.params.contactname &&
            contacts.unshift(contacts.splice(idx, 1)[0]),
        );
        await app.models.User.findOneAndUpdate(
          { username: req.params.username },
          { contacts },
        );
        res.status(200).send({
          id: found.chatroomId,
        });
        return;
      }
      res.status(404).send({ error: 'unknown room' });
    }
  });

  app.get('/chatroom/:id', async (req, res) => {
    try {
      const room = await app.models.Chatroom.findById(req.params.id);
      if (!room) {
        res.status(404).send({ error: `unknown room: ${req.params.id}` });
      } else {
        res.status(200).send({
          messages: room.messages,
        });
      }
    } catch (err) {
      console.log(`Room.get failure: ${err}`);
      res.status(404).send({ error: `unknown room: ${req.params.id}` });
    }
  });
};
