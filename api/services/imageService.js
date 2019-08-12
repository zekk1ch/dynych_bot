const util = require('./utilService');
const constants = require('../constants');

let memeUrls = [];

const fetchRandomMemeUrls = async () => {
    try {
        const response = await util.makeRequest(constants.memeUrlsUrl);
        const memes = await response.json();

        Object.values(memes).forEach(meme => {
            if (meme.ImgSrc) {
                memeUrls.push(`${constants.memeUrl}/${meme.ImgSrc[0]}`);
            }
        });
    } catch (err) {
        console.error(err);
        throw new Error('Failed to load random image URLs');
    }
};

const getRandomMemeUrl = async () => {
    if (!memeUrls.length) {
        await fetchRandomMemeUrls();
    }

    return memeUrls.shift();
};

module.exports = {
    getRandomMemeUrl,
};
