const { User } = require("../models/user");
const authutils = require("./authutils");
const { getApiKey } = require('../middleware/apikeys');

/** Create a new user and return a token
 * @param  {} name
 * @param  {} email
 * @param  {} password
 * @returns {token, user}
 */
const createUser = async (name, email, password, isAdmin = false) => {
  try {
    // New user object
    let user = new User({
      "name": name,
      "email": email,
      "isAdmin": isAdmin
    });

    // Generage API Key
    // user = getApiKey(user, req);

    // Hash the password
    const saltHash = authutils.genPassword(password);
    user.salt = saltHash.salt;
    user.hash = saltHash.hash;

    // console.log(user);

    // Save to DB
    await user.save();

    let token = authutils.issueJWT(user);

    const tokenParts = token.token.split(' ');
    if (tokenParts[0] === 'Bearer' && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null) {
      token = `Bearer ${tokenParts[1]}`;
    }
    else {
      token = "";
    }

    // console.log("userutils TOKEN=", token);

    return { token: token, user: user };

  } catch (err) {
    console.log(err);
    return null;
  }
}

/** Create a new user and return a token
 * @param  {} User object
 * @returns {token, user}
 */
const createUserObject = async (userObj, origin = null, usage = 0) => {
  try {
    // New user object
    let user = new User(userObj);

    // Generage API Key
    if (origin) {
      user = getApiKey(user, {
        headers: {
          host: origin
        }
      });
    }

    // Hash the password
    const saltHash = authutils.genPassword(userObj.password);
    user.salt = saltHash.salt;
    user.hash = saltHash.hash;

    if (usage > 0) {
      user.usage[0].count = usage;
    }

    // Save to DB
    await user.save();

    let token = authutils.issueJWT(user);

    const tokenParts = token.token.split(' ');
    if (tokenParts[0] === 'Bearer' && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null) {
      token = `Bearer ${tokenParts[1]}`;
    }
    else {
      token = "";
    }

    // console.log("userutils TOKEN=", token);

    return { token: token, user: user };

  } catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = { createUser, createUserObject };