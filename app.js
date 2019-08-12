require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/router');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/*', (req, res, next) => {
    console.log('\n\n'+ req.method + '   ' + req.protocol + '://' + req.get('host') + req.originalUrl + '\n\n');
    next();
});

app.use('/', router);

module.exports = app;
