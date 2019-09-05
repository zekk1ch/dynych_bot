const requestLogger = (req, res, next) => {
    let info = '';
    info += `${req.method} ${req.originalUrl}`;
    if (Object.entries(req.body).length) {
        info += '\nbody:\n%o';
        console.log(info, req.body);
    } else {
        console.log(info);
    }

    next();
};

module.exports = {
    requestLogger,
};
