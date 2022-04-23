const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.ObjectId,
    auto: true,
  },
  created_by: {
    type: String,
    required: true,
  },
  assigned_to: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['NEW', 'POSTED', 'ASSIGNED', 'SHIPPED'],
    required: true,
  },
  state: {
    type: String,
    enum: [null, 'En route to Pick Up', 'Arrived to Pick Up',
      'En route to delivery', 'Arrived to delivery'],
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  payload: {
    type: Number,
    max: [4000, 'Too big'],
    required: true,
  },
  pickup_address: {
    type: String,
    required: true,
  },
  delivery_address: {
    type: String,
    required: true,
  },
  dimensions: {
    width: {
      type: Number,
      max: [700, 'Too big'],
      required: true,
    },
    length: {
      type: Number,
      max: [350, 'Too big'],
      required: true,
    },
    height: {
      type: Number,
      max: [200, 'Too big'],
      required: true,
    },
  },
  logs: {
    message: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now(),
    },

  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Load', loadSchema);
