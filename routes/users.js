const router = require('express').Router();
const User = require('../models/user');
const Credentials = require('../models/credentials');
const RegistrationCredentials = require('../models/registrationCredentials');
const Truck = require('../models/truck');
const Load = require('../models/load');
const verify = require('./verifyToken');
const bcrypt = require('bcryptjs');

router.get('/me', verify, async (req, res)=>{
  try {
    const currCredentials = await RegistrationCredentials.findOne(
        {_id: req.user._id});
    const currUser = await User.findOne({email: currCredentials.email});
    return res.status(200).send({
      user: {
        _id: currUser._id,
        role: currUser.role,
        email: currCredentials.email,
        createdDate: currUser.createdDate,
      },
    });
  } catch (err) {
    return res.status(400).json({
      'message': 'user error',
    });
  }
});

router.delete('/me', verify, async (req, res)=>{
  try {
    const currCredentials = await RegistrationCredentials.findOne(
        {_id: req.user._id});
    const currUser = await User.findOne({email: currCredentials.email});
    await User.findOneAndRemove({email: currCredentials.email});
    await Credentials.findOneAndRemove(
        {email: currCredentials.email});
    await RegistrationCredentials.findOneAndRemove(
        {email: currCredentials.email});
    if (currCredentials.role === 'DRIVER') {
      await Truck.deleteMany({assigned_to: currUser._id});
    } else {
      await Load.deleteMany({created_by: currUser._id});
    }
    return res.status(200).send({'message': 'Profile deleted successfully'});
  } catch (err) {
    return res.status(400).json({
      'message': err.message,
    });
  }
});


router.patch('/me/password', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const validPass = await bcrypt.compare(req.body.oldPassword,
      currCredentials.password);
  if (validPass) {
    await Credentials.findOneAndUpdate({_id: req.user._id},
        {password: req.body.newPassword});
    await RegistrationCredentials.findOneAndUpdate({_id: req.user._id},
        {password: req.body.newPassword});
    console.log('ok');
    return res.status(200).send({'message': 'Success'});
  } else {
    console.log('old password do not match');
    return res.status(400).send({'message': 'passwords do not match'});
  }
});

module.exports = router;
