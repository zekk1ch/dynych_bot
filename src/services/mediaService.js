const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const util = require('./utilService');
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
        const [info, response] = await Promise.all([
            ytdl.getBasicInfo(url),
            ytdl(url, { format }),
        ]);

        const [filePath, thumbnailPath] = await Promise.all([
            saveFile(`${info.title}.${format}`, response),
            fetchImage(info.player_response.videoDetails.thumbnail.thumbnails[2].url, `${util.getRandomString()}.jpeg`),
        ]);

        return { filePath, thumbnailPath };
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch video from ${url}`);
    }
};

module.exports = {
    fetchImage,
    fetchVideo,
    deleteFile,
};
