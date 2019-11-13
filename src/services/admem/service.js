const constants = require('./constants');
const util = require('./util');
let pendingMemes = [];

const fetchMemes = async () => {
    const options = {
        headers: {
            cookie: constants.ADMEM_COOKIE,
        },
    };
    const memesData = await util.makeRequest(constants.ADMEM_IMAGE_URLS_URL, options);

    let memes = [];
    for (let memeData of Object.values(memesData)) {
        if ('ImgSrc' in memeData) {
            memes.push({
                fileUrl: `${constants.ADMEM_IMAGE_URL}${memeData.ImgSrc[0]}`,
                fileName: memeData.ImgSrc[0],
            });
        }
    }

    return memes;
};

const getRandomDownloadFile = async () => {
    if (!pendingMemes.length) {
        pendingMemes = await fetchMemes();
        if (!pendingMemes.length) {
            throw new Error('Meme server didn\'t send any fresh memes');
        }
    }

    const { fileUrl, fileName } = pendingMemes.shift();
    const { fileStream, fileSize } = await util.fetchFile(fileUrl);

    return {
        fileUrl,
        fileStream,
        fileSize,
        fileName,
    };
};

module.exports = {
    getRandomDownloadFile,
};
