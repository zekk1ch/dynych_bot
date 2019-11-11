const express = require('express');
const bodyParser = require('body-parser');
const env = require('../env');
const loggers = require('./middleware/loggers');
const router = require('./router');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(loggers.request());

app.use(express.static('public'));
app.post(`/${env.BOT_TOKEN}`, router);
app.use('/*', (req, res) => res.status(404).end());

module.exports = app;
