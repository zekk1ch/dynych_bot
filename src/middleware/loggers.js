const requestLogger = (req, res, next) => {
    console.log(res.url);
    console.log(res.originalUrl);
    console.log(res.baseUrl);
    console.log(res.domain);
    console.log(`
New incoming ${req.method} request to ${req.originalUrl}
`);

    next();
};

module.exports = {
    requestLogger,
};
