const requestLogger = (req, res, next) => {
    console.log(req.url);
    console.log(req.originalUrl);
    console.log(req.baseUrl);
    console.log(req.domain);
    console.log(`
New incoming ${req.method} request to ${req.originalUrl}
`);
    console.log('REQUEST.BODY');
    if (req.body) {
        console.log(req.body);

    }
    console.log('REQUEST.TEXT');
    if (req.text) {
        console.log(req.text);
    }

    next();
};

module.exports = {
    requestLogger,
};
