'use strict';

const users = require('../models/users.js');
const Token = require('../models/tokens.js');

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      next('Invalid Login');
    }

    const token = req.headers.authorization.split(' ').pop();
    const validUser = await users.authenticateWithToken(token);

    req.user = validUser;
    req.token = validUser.token;

    // update the token saved in database
    await Token.findOneAndDelete({ userId: req.user._id });
    let newAccessToken =  new Token({ userId: req.user._id, access: req.user.token });
    await newAccessToken.save();

    next();
  } catch (e) {
    res.status(403).send('Invalid Login');
  }
};
