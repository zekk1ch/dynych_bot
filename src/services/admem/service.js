const constants = require('./constants');
const util = require('./util');
let pendingUrls = [];

const fetchRandomMemeUrls = async () => {
    const options = {
        headers: {
            cookie: constants.ADMEM_COOKIE,
        },
    };
    const data = await util.makeRequest(constants.ADMEM_IMAGE_URLS_URL, options);

    let memeUrls = [];
    for (let memeData of Object.values(data)) {
        if ('ImgSrc' in memeData) {
            memeUrls.push(`${constants.ADMEM_IMAGE_URL}${memeData.ImgSrc[0]}`);
        }
    }

    return memeUrls;
};

const getRandomMemeUrl = async () => {
    if (!pendingUrls.length) {
        pendingUrls = await fetchRandomMemeUrls();
        if (!pendingUrls.length) {
            throw new Error('Meme server didn\'t send any fresh memes');
        }
    }

    return pendingUrls.shift();
};

module.exports = {
    getRandomMemeUrl,
};
