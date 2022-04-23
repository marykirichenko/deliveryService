const mongoose = require('mongoose');
const registrationCredentialsSchema = new mongoose.Schema({
  email: {
        type: String,
        required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['SHIPPER', 'DRIVER'],
    required: true,
  }
});
module.exports = mongoose.model('RegistrationCredentials', registrationCredentialsSchema);