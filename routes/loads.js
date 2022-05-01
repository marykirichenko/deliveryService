const router = require('express').Router();
const User = require('../models/user');
const RegistrationCredentials = require('../models/registrationCredentials');
const verify = require('./verifyToken');
const Truck = require('../models/truck');
const Load = require('../models/load');
const mongoose = require('mongoose');

router.post('/', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  const userRole = currUser.role==='SHIPPER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a shipper',
    });
  }
  try {
    const load = new Load({
      created_by: currUser._id,
      assigned_to: 0,
      status: 'NEW',
      name: req.body.name,
      payload: req.body.payload,
      pickup_address: req.body.pickup_address,
      delivery_address: req.body.delivery_address,
      dimensions: {
        width: req.body.dimensions.width,
        length: req.body.dimensions.length,
        height: req.body.dimensions.height,
      },
      logs: {
        message: 'Load posted',
      },
    });
    await load.save();
    return res.status(200).send({
      'message': 'Load created successfully',
    });
  } catch (err) {
    return res.status(400).json({
      'message': err.message,
    });
  }
},
);

router.get('/active', verify, async (req, res)=>{
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
    const activeLoad = await Load.findOne({assigned_to: currUser._id});
    if(!activeLoad8){
         return res.status(400).send({
              'message': 'this driver dont have any active loads',
            })
    }
    return res.status(200).send({
      'load': activeLoad,
    });
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

router.post('/:id/post', verify, async (req, res)=> {
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  const userRole = currUser.role==='SHIPPER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a shipper',
    });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const isLoadExists = await Load.findOne({_id: req.params['id']});
  if (!isLoadExists) {
    return res.status(400).send({
      'message': 'no loads with this id exists',
    });
  }
  try {
    const activeLoad = await Load.findOne({_id: req.params['id']});
    if (activeLoad.status !== 'NEW') {
      return res.status(400).send({
        'message': 'Load was already posted',
      });
    }
    await Load.findOneAndUpdate({_id: req.params['id']}, {
      logs: {message: 'Load is posted'},
      status: 'POSTED',
    });
    let truckType = '';
    if (activeLoad.payload<1700 && activeLoad.dimensions.width<300 &&
        activeLoad.dimensions.length<250 &&
        activeLoad.dimensions.height<170) {
      truckType = 'SPRINTER';
    } else if (activeLoad.payload<2500 && activeLoad.dimensions.width<500 &&
        activeLoad.dimensions.length<250 &&
        activeLoad.dimensions.height<170) {
      truckType = 'SMALL STRAIGHT';
    } else if (activeLoad.payload<4000 && activeLoad.dimensions.width<700 &&
        activeLoad.dimensions.length<350 &&
        activeLoad.dimensions.height<200) {
      truckType= 'LARGE STRAIGHT';
    }

    const availableDriver = await Truck.findOne({$and: [
      {assigned_to: {$ne: '0'}},
      {status: 'IS'},
      {type: truckType},
    ]});
    if (availableDriver) {
      await Load.findOneAndUpdate({_id: req.params['id']}, {
        logs: {message: `Load is assigned to ${availableDriver._id}`},
        status: 'ASSIGNED',
        state: 'En route to Pick Up',
        assigned_to: availableDriver.assigned_to,
      });

      await Truck.findOneAndUpdate({_id: availableDriver._id}, {
        status: 'OL',
      });
      console.log('Load is assigned to driver');
      return res.status(200).send({
        'message': 'Load posted successfully',
        'driver_found': true,
      });
    } else {
      await Load.findOneAndUpdate({_id: req.params['id']}, {
        logs: {message: `No drivers were found`},
        status: 'NEW',
      });
      return res.status(200).send({
        'message': 'No drivers',
        'driver_found': false,
      });
    }
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

router.get('/:id', verify, async (req, res)=> {
  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const currLoad = await Load.findOne({_id: req.params['id']});
  if (!currLoad) {
    return res.status(400).send({
      'message': 'no loads with this id exists',
    });
  }
  try {
    return res.status(200).send({
      'load': currLoad,
    });
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

router.get('/:id/shipping_info', verify, async (req, res)=>{
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  const userRole = currUser.role==='SHIPPER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a shipper',
    });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const isLoadExists = await Load.findOne({_id: req.params['id']});
  if (!isLoadExists) {
    return res.status(400).send({
      'message': 'no loads with this id exists',
    });
  }
  try {
    const assignedTruck = await Truck.findOne(
        {assigned_to: isLoadExists.assigned_to});
    return res.status(200).send({
      'load': isLoadExists,
      'truck': assignedTruck,
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
  const userRole = currUser.role==='SHIPPER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a shipper',
    });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const isLoadExists = await Load.findOne({_id: req.params['id']});
  if (!isLoadExists) {
    return res.status(400).send({
      'message': 'no loads with this id exists',
    });
  }
  try {
    await Load.findOneAndUpdate({_id: req.params['id']},
        {name: req.body.name,
          payload: req.body.payload,
          pickup_address: req.body.pickup_address,
          delivery_address: req.body.delivery_address,
          dimensions: {
            width: req.body.dimensions.width,
            length: req.body.dimensions.length,
            height: req.body.dimensions.height,
          },
        });
    return res.status(200).send({
      'message': 'Load details changed successfully',
    });
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
  const userRole = currUser.role==='SHIPPER'?true:false;
  if (userRole===false) {
    return res.status(400).json({
      'message': 'user is not a shipper',
    });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
    return res.status(400).send({
      'message': 'not valid type of id',
    });
  }
  const isLoadExists = await Load.findOne({_id: req.params['id']});
  if (!isLoadExists||isLoadExists.status!=='NEW') {
    return res.status(400).send({
      'message': 'load either dont exists or dont valid',
    });
  }
  try {
    await Load.deleteOne({_id: req.params['id']});
    return res.status(200).send({
      'message': 'Load deleted successfully',
    });
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

router.patch('/active/state', verify, async (req, res)=>{
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
    const currLoad = await Load.findOne({assigned_to: currUser._id});
    let newStatus='';
    switch (currLoad.state) {
      case 'En route to Pick Up':
        newStatus = 'Arrived to Pick Up';
        break;
      case 'Arrived to Pick Up':
        newStatus ='En route to delivery';
        break;
      case 'En route to delivery':
        newStatus ='Arrived to delivery';
        break;
      case 'Arrived to delivery':
        await Truck.updateOne({assigned_to: currUser._id},
            {status: 'IS'});
        await Load.updateOne({assigned_to: currUser._id},
            {status: 'SHIPPED'});
        return res.status(200).send({
          'message': 'Load is already arrived',
        });
    }
    await Load.updateOne({assigned_to: currUser._id}, {state: newStatus});
    return res.status(200).send({
      'message': `Load state changed ${newStatus}`,
    });
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

router.get('/', verify, async (req, res) =>{
  const currCredentials = await RegistrationCredentials.findOne(
      {_id: req.user._id});
  const currUser = await User.findOne({email: currCredentials.email});
  const limit = parseInt(req.query.limit) ||1;
  const offset = parseInt(req.query.limit)||1;
  try {
    const result = currUser.role ==='DRIVER'?await Load.find(
        {assigned_to: currUser._id}):await Load.find(
            {created_by: currUser._id});
    const startIndex = (offset-1)* limit;
    const endIndex = offset* limit;
    const paginatedRes = result.slice(startIndex, endIndex);
    return res.status(200).send({
      'loads': paginatedRes,
    });
  } catch (err) {
    return res.status(400).send({
      'message': err.message,
    });
  }
});

module.exports = router;

