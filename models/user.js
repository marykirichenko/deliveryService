const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.ObjectId,
    auto: true,
  },
  role: {
    type: String,
    required: true,
  },
  email: {
      type: String,
      required: true,
    },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});
module.exports = mongoose.model('User', userSchema);
