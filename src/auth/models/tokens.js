'use strict';

const mongoose = require('mongoose');

const tokens = new mongoose.Schema({
  userId: {type: String, required: true, unique: true },
  access: { type: String, required: true, unique: true },
//   refresh: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('tokens', tokens);
