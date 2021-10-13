const { User } = require('../../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const { getApiKey } = require("../../../middleware/apikeys");
const authutils = require("../../../src/authutils");

describe('user.generateAuthToken', () => {
  it('should return a valid JWT', () => {
    const req = {
      headers: {
        host: "domain.com"
      },
      body: {
        password: "test123"
      }
    };
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "user@domain.com",
      isAdmin: true
    };
    let user = new User(payload);
    user = getApiKey(user, req);

    const saltHash = authutils.genPassword(req.body.password);
    user.salt = saltHash.salt;
    user.hash = saltHash.hash;

    const isValid = authutils.validPassword(req.body.password, user.hash, user.salt);
    expect(isValid).toBe(true);
  });
});