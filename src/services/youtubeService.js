const mediaService = require('./mediaService');

const fetchVideo = async (url) => {
    const fileName = url.split('/').pop() + '.mp3';

    try {
        const response = await ytdl(url, { format: 'mp3' });

        return await mediaService.saveFile(fileName, response);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch image from ${url}`);
    }
};

module.exports = {
    fetchVideo,
};
