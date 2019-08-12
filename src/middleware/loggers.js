const requestLogger = (req, res, next) => {
    console.log(`\n\n${req.method} ${req.originalUrl}${req.body ? (`\nbody:\n${req.body}`): ''}\n\n`);

    next();
};

module.exports = {
    requestLogger,
};
