const requestLogger = (req, res, next) => {
    console.log(`\n${req.method} ${req.originalUrl}${req.body ? '' : '\n\n'}`);
    if (req.body) {
        console.log(`\nbody:\n${req.body}`);
    }

    next();
};

module.exports = {
    requestLogger,
};
