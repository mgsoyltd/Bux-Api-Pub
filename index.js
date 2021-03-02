const winston = require("winston");
const express = require("express");
const config = require("config");
const { addColors } = require("winston/lib/winston/config");
const app = express();
const path = require('path');

// Save the app's root directory
global.appRoot = path.resolve(__dirname);

require("./startup/logging")();
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