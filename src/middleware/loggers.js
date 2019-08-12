const requestLogger = (req, res, next) => {
    console.log(`\n${req.method} ${req.originalUrl}${req.body ? '' : '\n\n'}`);
    if (req.body) {
        console.info('\n\n%o\n\n', req.body);
        console.info('\n\n%O\n\n', req.body);
    }

    next();
};

module.exports = {
    requestLogger,
};
