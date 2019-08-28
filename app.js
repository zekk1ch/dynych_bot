const express = require('express');
const bodyParser = require('body-parser');
const routers = require('./src/routers');
const loggers = require('./src/middleware/loggers');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(loggers.requestLogger);

app.use(express.static('public'));
app.use('/game/:id', express.static('public/game'));
app.use('/js/pickerjs', express.static('node_modules/pickerjs/dist'));
app.use('/api/reminder', routers.reminder);
app.use('/', routers.telegram);
app.use('/*', (req, res) => res.status(404).send(`Route "${req.method} ${req.originalUrl}" is not supported`));

module.exports = app;
