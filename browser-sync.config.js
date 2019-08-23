const env = require('./env');

module.exports = {
    proxy: `127.0.0.1:${env.PORT}`,
    files: 'public',
    watch: true,
    open: false,
    minify: false,
};
