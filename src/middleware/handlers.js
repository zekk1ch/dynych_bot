const noRouteHandler = (err, req, res, next) => {
    res.status(404).send(`Route "${req.method} ${req.originalUrl}" doesn't exist`);
};

module.exports = {
    noRouteHandler,
};
