const requestLogger = (req, res, next) => {
    let info = '\n\n';
    info += `${req.method} ${req.originalUrl} from ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`;
    if (Object.entries(req.body).length) {
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
