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

const explainError = () => ({
    statusCode: 500,
    message: 'Что-то пошло не так...',
});

module.exports = {
    explainError,
    makeRequest,
};
