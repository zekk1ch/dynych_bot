const fetch = require('node-fetch');

const makeRequest = async (url, options) => {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        throw data;
    }
};

const fetchFile = async (url) => {
    const response = await fetch(url);

    return {
        fileSize: response.headers.get('content-length'),
        fileStream: response.body,
    };
};

const fireAndForget = async (fn, ...args) => {
    try {
        await fn(...args);
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    makeRequest,
    fetchFile,
    fireAndForget,
};
