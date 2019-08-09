const fetch = require('node-fetch');

const makeRequest = (url, options = {}) => fetch(url, {
    ...options,
    headers: {
        cookie: 'beget=begetok; PHPSESSID=d41234414463174a8e890036f21cc2a7',
    }
});

module.exports = {
    makeRequest,
};
