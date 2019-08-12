const requestLogger = (req, res, next) => {
    console.log(`\n${req.method} ${req.originalUrl}${req.body ? '' : '\n\n'}`);
    if (req.body) {
        console.info(`\n\n${req.body}\n\n`, '%o');
        console.info(`\n\n${req.body}\n\n`, '%O');
    }

    next();
};

module.exports = {
    requestLogger,
};
