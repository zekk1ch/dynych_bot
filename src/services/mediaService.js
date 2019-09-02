const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const constants = require('../constants');

const saveFile = (fileName, readStream) => new Promise((resolve, reject) => {
    const filePath = path.join(constants.rootPath, 'temp', fileName);

    const writeStream = fs.createWriteStream(filePath, { flags: 'wx' });
    readStream.pipe(writeStream);

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', (err) => {
        if (err.code === 'EEXIST') {
            resolve(filePath)
        } else {
            reject(err);
        }
    });
});

const deleteFile = (filePath) => new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            reject(err);
        }
        resolve();
    });
});

const fetchImage = async (url, fileName) => {
    try {
        const response = await fetch(url);

        return await saveFile(fileName || url.split('/').pop(), response.body);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch image from ${url}`);
    }
};

const fetchVideo = async (url, format = 'mp4') => {
    if (!ytdl.validateURL(url)) {
        throw new Error(`Invalid video URL – ${url}`);
    }

    try {
        const [info, file] = await Promise.all([
            ytdl.getBasicInfo(url),
            ytdl(url, { format }),
        ]);

        return await saveFile(`${info.title}.${format}`, file);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch video from ${url}`);
    }
};

const fetchThumbnail = async (url) => {
    const info = await ytdl.getBasicInfo(url);
    return await fetchImage(info.player_response.videoDetails.thumbnail.thumbnails[2].url);
};

module.exports = {
    fetchImage,
    fetchVideo,
    deleteFile,
    fetchThumbnail,
};
