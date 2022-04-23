const router = require('express').Router();
const User = require('../models/user');
const Credentials = require('../models/credentials');
const RegistrationCredentials = require('../models/registrationCredentials');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res)=>{
  const emailExists = await User.findOne({email: req.body.email});
  if (emailExists) {
    console.log('email already exists');
    return res.status(400).json({
      'message': 'User already exists',
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const registrationCredentials = new RegistrationCredentials({
    email: req.body.email,
    password: hashPassword,
    role: req.body.role,
  });
  const user = new User({
    role: req.body.role,
    email: req.body.email,
  });
  const credentials = new Credentials({
    email: req.body.email,
    password: hashPassword,
  });
  try {
    await user.save();
    await credentials.save();
    await registrationCredentials.save();
    console.log('registered successfully');
    res.status(200).json(
        {
          'message': 'Profile created successfully',
        });
  } catch (err) {
    console.log('registration error');
    res.status(400).json({
      'message': 'saving error, something wrong',
    });
  }
});

router.post('/login', async (req, res)=>{
  const user = await RegistrationCredentials.findOne({email: req.body.email});
  if (user) {
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      console.log('invalid password');
      return res.status(400).json({'message': 'invalid password'});
    }
    const token = jwt.sign({_id: user._id}, process.env.token);
    res.header('token-auth', token).status(200).json({
      'jwt_token': token,
    });
  } else {
    console.log('user dont exists');
    return res.status(400).json({
      'message': 'user dont exists',
    });
  }
});

module.exports = router;
