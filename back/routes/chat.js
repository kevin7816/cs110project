const express = require('express');
const router = express.Router()
const User = require('../model/user')
const Room = require('../model/room');
const Message = require('../model/messages');
const session = require('express-session');

module.exports = router;


// Send a new message
router.post('/send', async (req, res) => {
  const username = req.session.username;
  const { message } = req.body;
  const newMessage = new Message({ text, sender, room });
  await newMessage.save();
  res.status(200).json({ message: 'Message sent successfully' });
  console.log("Here");
  res.send("called post")
  
});

