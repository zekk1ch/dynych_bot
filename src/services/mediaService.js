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

const fetchImage = async (url) => {
    try {
        const response = await fetch(url);

        const fileName = url.split('/').pop();
        return await saveFile(fileName, response.body);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch image from ${url}`);
    }
};

const fetchVideo = async (url) => {
    if (!ytdl.validateURL(url)) {
        throw new Error(`Invalid video URL – ${url}`);
    }

    try {
        const response = await ytdl(url, { format: 'mp4' });

        const { title } = await ytdl.getBasicInfo(url);
        const fileName = `${title}.mp4`;
        return await saveFile(fileName, response);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to download video from ${url}`);
    }
};

const extractAudio = async (url) => {
    if (!ytdl.validateURL(url)) {
        throw new Error(`Invalid video URL – ${url}`);
    }

    try {
        const response = await ytdl(url, { format: 'mp3' });

        const { title } = await ytdl.getBasicInfo(url);
        const fileName = `${title}.mp3`;
        return await saveFile(fileName, response);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to extract audio from ${url}`);
    }
};

module.exports = {
    fetchImage,
    fetchVideo,
    extractAudio,
    deleteFile,
};
