const express = require('express');
const User = require('../model/user');
const router = express.Router()
const dotenv = require("dotenv");
const bcrypt = require('bcryptjs')
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

module.exports = router;

dotenv.config();

router.post('/login', async (req, res) => {
    const {session} = req;
    const { username, password } = req.body;

    // check if user in database
    const user = await User.findOne({ username });
    
    if (!user)
      return res.json({ msg: "Incorrect Username ", status: false });
    else if (await bcrypt.compare(password, user.password) != true)
      return res.json({ msg: "Incorrect Password", status: false });
    else {
      session.authenticated = true;
      session.username = username;
      res.json({ msg: "Logged in", status: true , username: username});
    }
});

// Set up a route for the logout page
router.get('/logout', (req, res) => {
    // Clear the session data and redirect to the home page
    req.session.destroy();
    res.send({msg: "Logged out", status: true})
  });

router.post('/signup', async (req, res)=>{
  console.log("user is trying to signup")
  const {username, password, name} = req.body;
  const hash = await bcrypt.hash(password, 8);
  console.log(hash);
  console.log(username, hash, name)
  const user = new User ({
      username: username,
      password: hash,
      name: name
  })

  try{
      const dataSaved = await user.save();
      res.status(200).json(dataSaved);
  }
  catch (error){
      console.log(error);
      res.send("ERROR!")
  }
});

router.get('/qrcode', (req,res) => {
  const secret = speakeasy.generateSecret();
  const temp = secret.base32;

  const hotpUri = speakeasy.otpauthURL({
    secret: temp,
    label: 'Final Project',
    type: 'hotp',
    counter: 0
  })

  QRCode.toDataURL(hotpUri, (err, dataURL) => {
    if(err){
      console.error('Error generating QR code:', err);
      res.status(500).json({ error: 'Error generating QR code' });
      return;
    }
    res.json({qrcode: dataURL, status: true, secret: temp})
  })

})
