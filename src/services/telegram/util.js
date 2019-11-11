const util = require('../../util');

const defaultOptions = {
    headers: {},
};
const makeRequest = async (url, srcOptions = defaultOptions) => {
    const options = {
        ...srcOptions,
        method: srcOptions.method || 'POST',
        headers: {
            'content-type': 'application/json',
            ...srcOptions.headers,
        },
    };
    return util.makeRequest(url, options);
};

module.exports = {
    ...util,
    makeRequest,
};
