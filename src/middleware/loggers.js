const env = require('../../env');
const constants = require('../constants');

const escapeBotToken = (value) => {
    switch (typeof value) {
        case 'string':
            return escape(value);
        case 'object':
            let string = JSON.stringify(value);
            string = escape(string);
            return JSON.parse(string);
        default:
            return value;
    }

    function escape(string) {
        return string.replace(new RegExp(env.BOT_TOKEN, 'g'), '<BOT_TOKEN>');
    }
};

const logDelimiter = () => {
    console.log();
};
const logMethod = (req) => {
    console.log('method:', req.method);
};
const logRoute = (req) => {
    const escaped = escapeBotToken(req.url);
    console.log('route:', escaped);
};
const logBody = (req) => {
    const escaped = escapeBotToken(req.body);
    console.log('body: %o', escaped);
};

const request = () => (req, res, next) => {
    logDelimiter();
    logMethod(req);
    logRoute(req);
    if (env.MODE === constants.MODE_PRODUCTION) {
        logBody(req);
    }
    logDelimiter();

    next();
};

module.exports = {
    request,
};
