'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Token = require('./tokens');

const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Adds a virtual field to the schema. We can see it, but it never persists
// So, on every user object ... this.token is now readable!
users.virtual('token').get(function () {
  let tokenObject = {
    username: this.username,
  };
  return jwt.sign(tokenObject, process.env.SECRET, { expiresIn: 60 * 15 });
});

users.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// BASIC AUTH
users.statics.authenticateBasic = async function (username, password) {
  const user = await this.findOne({ username });
  const valid = await bcrypt.compare(password, user.password);
  if (valid) {
    return user;
  }
  throw new Error('Invalid User');
};

// BEARER AUTH
users.statics.authenticateWithToken = async function (token) {
  try {
    const parsedToken = jwt.verify(token, process.env.SECRET);
    const user = await this.findOne({ username: parsedToken.username });
    if (user) {
      //get the token for this user from the database
      const dbToken = await Token.findOne({userId: user._id});
      // check if the token the clien sent is the same we have in our database
      if(dbToken.access === token){
        return user;
      } else {
        throw new Error('Invalid Token');
      }
    }
    throw new Error('User Not Found');
  } catch (e) {
    throw new Error(e.message);
  }
};

module.exports = mongoose.model('users', users);
