const express = require('express');
const bodyParser = require('body-parser');
const env = require('../env');
const loggers = require('./middleware/loggers');
const botApi = require('./api/bot/router');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(loggers.request());

app.use(express.static('public'));
app.use(`/${env.BOT_TOKEN}`, botApi);
app.use('/*', (req, res) => res.status(404).end());

module.exports = app;
