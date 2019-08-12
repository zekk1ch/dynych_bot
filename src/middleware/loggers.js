const requestLogger = (req, res, next) => {
    let info = '\n\n';
    info += `${req.method} ${req.originalUrl}`;
    if (req.body) {
        info += '\nbody:\n%o';
        info += '\n\n';
        console.log(info, req.body);
    } else {
        info += '\n\n';
        console.log(info);
    }

    next();
};

module.exports = {
    requestLogger,
};
