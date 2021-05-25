'use strict';

const base64 = require('base-64');
const User = require('../models/users.js');
const Token = require('../models/tokens.js');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) {  next('Invalid Login'); }

  let basic = req.headers.authorization.split(' ').pop();
  let [user, pass] = base64.decode(basic).split(':');

  try {
    req.user = await User.authenticateBasic(user, pass);
    // update the token saved in database
    await Token.findOneAndDelete({ userId: req.user._id });
    let newAccessToken =  new Token({ userId: req.user._id, access: req.user.token });
    await newAccessToken.save();
    next();
  } catch (e) {
    res.status(403).send('Invalid Login');
  }

}

