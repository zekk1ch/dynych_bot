const env = require('../../env');

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

const logRequest = (method, route, body) => console.log(`
method: %s
route: %s
body: %o
`, method, route, body);

const request = () => (req, res, next) => {
    const route = escapeBotToken(req.url);
    const body = escapeBotToken(req.body);

    logRequest(req.method, route, body);

    next();
};

module.exports = {
    request,
};
