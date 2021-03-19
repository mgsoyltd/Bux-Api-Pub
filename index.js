const winston = require("winston");
const express = require("express");
const config = require("config");
const { addColors } = require("winston/lib/winston/config");
const app = express();
const path = require('path');

// Save the app's root directory
global.appRoot = path.resolve(__dirname);

// Allow cross-origin requests
// app.options('/', function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', "*");
//     res.header('Access-Control-Allow-Methods', "GET, POST, OPTIONS, PUT, DELETE");
//     res.header("Access-Control-Allow-Headers", "X-API-KEY, X-AUTH-TOKEN, X-CSRF-Token, Origin, X-Requested-With, Content-Type, Content-Length, Date, X-Api-Version, X-File-Name, Content-MD5, Accept, Accept-Version, Access-Control-Request-Method");
//     res.header("Access-Control-Max-Age", "1728000");
//     console.log("<<<RES HEADER>>>", res.header);
//     return res.sendStatus(200);
// });

require("./startup/logging")();
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/config")();
require("./startup/db")();
require("./startup/validation")();

// JUST FOR TESTING UNCAUGHT PROMISE EXCEPTION
// const p = Promise.reject("Something went down");
// p.then("Done");

const port = process.env.PORT || config.get("port") || 3000;

app.get('/', (req, res) => {
    // Health check route
    res.status(200).send({ data: { message: 'Welcome to the Bux API.' } });
});

const server = app.listen(port, (err) => {
    if (err) {
        winston.error(`Failure to launch server on port ${port}...`);
        return;
    }
    winston.info(`Listening on port ${port}...`);
});

module.exports = server;