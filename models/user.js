const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
      username: String,
      name: String,
      password: String,
      email: String,
    role: {
      type: String,
      enum: ['user', 'recruiter', 'admin'],
      default: 'user'
    }

});

module.exports = mongoose.model('user', userSchema);
