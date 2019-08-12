const fetch = require('node-fetch');

const makeRequest = async (url, method = 'GET', body) => {
    const options = {
        method,
        headers: {
            cookie: 'beget=begetok; PHPSESSID=d41234414463174a8e890036f21cc2a7',
        },
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        console.error(`\n\n::: Network connection error – ${method} ${url} :::\n\n`);
        console.log();
        console.log(data);
        throw new Error(JSON.stringify(data));
    }
};

module.exports = {
    makeRequest,
};
