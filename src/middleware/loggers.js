const requestLogger = (req, res, next) => {
    let info = `${req.method} ${req.originalUrl}`;
    if (req.body) {
        info += '\nbody:\n';
        info += req.body;
        info += '\n';
        info += JSON.stringify(req.body);
        info += '\n';
    }
    info = `\n\n${info}\n\n`;

    console.log(info);
    next();
};

module.exports = {
    requestLogger,
};
