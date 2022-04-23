const router = require('express').Router();
const User = require('../models/user');
const RegistrationCredentials = require('../models/registrationCredentials');
const verify = require('./verifyToken');
const Truck = require('../models/truck');
const mongoose = require('mongoose');

router.post('/', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  const userRole = currUser.role==='DRIVER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a driver',
    });
  }
  try {
    const newTruck = new Truck({
      created_by: currUser._id,
      assigned_to: 0,
      type: req.body.type,
    });
    await newTruck.save();
    return res.status(200).send({
      'message': 'Truck created successfully',
    });
  } catch (err) {
    return res.status(400).json({
      'message': err.message,
    });
  }
},
);

router.post('/:id/assign', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});

  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const userRole = currUser.role==='DRIVER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a driver',
    });
  }
  const isTruckExists = await Truck.findOne({_id: req.params['id']});
  if (!isTruckExists) {
    return res.status(400).send({
      'message': 'no trucks with this id exists',
    });
  }

  const truck = await Truck.findOne({_id: req.params['id']});
  const assignedToUserTruck = await Truck.find({assigned_to: currUser._id});
  if (truck.assigned_to === '0' && assignedToUserTruck.length===0) {
    try {
      console.log(1);
      await Truck.findOneAndUpdate({_id: req.params['id']},
          {assigned_to: currUser._id});
      return res.status(200).send({
        'message': 'Truck assigned successfully',
      });
    } catch (err) {
      return res.status(200).send({
        'message': err.message,
      });
    }
  } else {
    console.log(2);
    return res.status(400).send({
      'message': 'truck is already assigned to someone or you have a truck',
    });
  }
});

router.get('/', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  const userRole = currUser.role==='DRIVER'?true:false;
  if (userRole===false) {
    res.status(400).json({
      'message': 'user is not a driver',
    });
  }
  try {
    const userTrucks = await Truck.find({created_by: currUser._id});
    return res.status(200).send({
      'trucks': userTrucks,
    });
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

router.get('/:id', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const userRole = currUser.role==='DRIVER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a driver',
    });
  }
  const isTruckExists = await Truck.findOne({_id: req.params['id']});
  if (!isTruckExists) {
    return res.status(400).send({
      'message': 'no trucks with this id exists',
    });
  }
  try {
    const truck = await Truck.findOne({_id: req.params['id']});
    return res.status(200).send({
      'truck': {
        '_id': truck._id,
        'created_by': truck.created_by,
        'assigned_to': truck.assigned_to,
        'type': truck.type,
        'status': truck.status,
        'created_date': truck.created_date,
      },
    });
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

router.put('/:id', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
  {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const userRole = currUser.role==='DRIVER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a driver',
    });
  }
  const isTruckExists = await Truck.findOne({_id: req.params['id']});
  if (!isTruckExists||isTruckExists.status==='OL') {
    return res.status(400).send({
      'message': 'invalid truck',
    });
  }
  try {
    const reqKeysType = Object.keys(req.body).includes('type');
    if (!reqKeysType) {
      return res.status(400).send({
        'message': 'invalid keys in body',
      });
    }
    if (reqKeysType) {
      await Truck.findOneAndUpdate({_id: req.params['id']},
          {type: req.body.type});
      return res.status(200).send({
        'message': 'Truck details changed successfully',
      });
    }
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

router.delete('/:id', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
  {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const userRole = currUser.role==='DRIVER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a driver',
    });
  }
  const isTruckExists = await Truck.findOne({_id: req.params['id']});
  if (!isTruckExists) {
    return res.status(400).send({
      'message': 'no trucks with this id exists',
    });
  }
  if (isTruckExists.status==='OL') {
    return res.status(400).send({
      'message': 'changing is restricted',
    });
  }
  try {
    await Truck.deleteOne({_id: req.params['id']});
    return res.status(200).send({'message': 'Truck deleted successfully'});
  } catch (err) {
    return res.status(400).send({'message': 'deleting truck error'});
  }
});

module.exports = router;
