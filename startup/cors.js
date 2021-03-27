const cors = require("cors");

module.exports = function (app) {

  // const whitelist = ["http://localhost:3001"];
  // const corsOptions = {
  //   origin: function (origin, callback) {
  //     console.log("ORIGIN", origin);
  //     if (whitelist.indexOf(origin) !== -1) {
  //       callback(null, true)
  //     } else {
  //       callback(new Error('Not allowed by CORS'))
  //     }
  //   }
  // }
  // app.use(cors(corsOptions));    // Enable only whitelist origins

  app.use(cors());    // Enable All CORS Requests

  // Allow cross-origin requests
  // app.options('/', function (req, res, next) {
  //     res.header('Access-Control-Allow-Origin', "*");
  //     res.header('Access-Control-Allow-Methods', "GET, POST, OPTIONS, PUT, DELETE");
  //     res.header("Access-Control-Allow-Headers", "X-API-KEY, X-AUTH-TOKEN, X-CSRF-Token, Origin, X-Requested-With, Content-Type, Content-Length, Date, X-Api-Version, X-File-Name, Content-MD5, Accept, Accept-Version, Access-Control-Request-Method");
  //     res.header("Access-Control-Max-Age", "1728000");
  //     console.log("<<<RES HEADER>>>", res.header);
  //     return res.sendStatus(200);
  // });

};
