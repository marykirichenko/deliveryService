const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['SPRINTER', 'SMALL STRAIGHT', 'LARGE STRAIGHT'],
    required: true,
  },
  status: {
    type: String,
    enum: ['OL', 'IS'],
    default: 'IS',
  },
  created_date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Truck', truckSchema);
