const fetch = require('node-fetch');
const constants = require('../constants');

let memeUrls = [];

const fetchRandomMemeUrls = async () => {
    const options = {
        headers: {
            cookie: constants.memeAuthCookie,
        },
    };
    const response = await fetch(constants.memeUrlsUrl, options);
    const memes = await response.json();

    Object.values(memes).forEach((meme) => {
        if (meme.ImgSrc) {
            memeUrls.push(`${constants.memeUrl}/${meme.ImgSrc[0]}`);
        }
    });
};

const getRandomMemeUrl = async () => {
    if (!memeUrls.length) {
        await fetchRandomMemeUrls();
    }

    return memeUrls.shift();
};

const getRandomMemeUrls = async () => {
    if (!memeUrls.length) {
        await fetchRandomMemeUrls();

    }
    return memeUrls.splice(0, memeUrls.length);
};

module.exports = {
    getRandomMemeUrl,
    getRandomMemeUrls,
};
