const { func, any } = require("joi");
const { isArguments, reject } = require("lodash");
const { User } = require("../models/user");

const MAX = process.env.API_MAX || 100;

const genKey = () => {
  //create a base-36 string that is always 30 chars long a-z0-9
  // 'an0qrr5i9u0q4km27hv2hue3ywx3uu'
  return [...Array(30)]
    .map((e) => ((Math.random() * 36) | 0).toString(36))
    .join('');
};

const getApiKey = (user, req) => {
  const today = new Date().toISOString().split('T')[0];
  user.host = req.header('origin');
  user.api_key = genKey();
  user.usage = [{ date: today, count: 0 }];
  return user;
};

const validateKey = async (req, res, next) => {

  // Where is the API key expected to be?
  const host = req.header('origin');
  const api_key = req.header('x-api-key');
  // console.log("<<<HOST/APIKEY>>>", host, api_key);
  if (!host || host === undefined ||
    !api_key || api_key === undefined) {
    // stop and respond
    res.status(403).send({ error: { code: 403, message: 'Not authorized.' } });
    return;
  }

  const account = await User.findOne(
    {
      host: host,
      api_key: api_key
    });

  // console.log("<<<ACCOUNT>>>", account);
  if (account) {
    // good match
    // check the usage
    const today = new Date().toISOString().split('T')[0];
    const usageIndex = account.usage.findIndex((day) => day.date === today);
    if (usageIndex >= 0) {
      // already used today
      if (account.usage[usageIndex].count >= MAX) {
        // stop and respond
        res.status(429).send({
          error: {
            code: 429,
            message: 'Max API calls exceeded.',
          },
        });
      } else {
        // have not hit todays max usage
        account.usage[usageIndex].count++;
        // save to DB
        await account.save();
        next();
      }
    } else {
      // not today yet
      account.usage.push({ date: today, count: 1 });
      // save to DB
      await account.save();
      // ok to use again
      next();
    }
  } else {
    // stop and respond
    res.status(403).send({ error: { code: 403, message: 'Not authorized.' } });
  }

};

module.exports = { getApiKey, validateKey };
