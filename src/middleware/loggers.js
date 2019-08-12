const requestLogger = (req, res, next) => {
    console.log(res.url);
    console.log(res.originalUrl);
    console.log(res.baseUrl);
    console.log(res.domain);
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
