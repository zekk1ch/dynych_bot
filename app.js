const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/router');
const loggers = require('./src/middleware/loggers');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(loggers.requestLogger);

app.use('/*', router);

module.exports = app;
