const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/router');
const loggers = require('./src/middleware/loggers');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(loggers.requestLogger);

app.use('/', router);
app.use('/*', (req, res) => res.status(404).send(`Route "${req.method} ${req.originalUrl}" is not supported`));

module.exports = app;
