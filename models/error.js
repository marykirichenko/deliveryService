const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Error', errorSchema);
