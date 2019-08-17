const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const constants = require('../constants');

const fetchImage = async (url) => {
    const id = url.split('/').pop();
    const imagePath = path.resolve(constants.rootPath, 'images', id);

    try {
        const response = await fetch(url);
        const stream = fs.createWriteStream(imagePath, { flags: 'wx' });
        response.body.pipe(stream);
        return await new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(imagePath));
            stream.on('error', (err) => reject(err));
        });
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch image from ${url}`);
    }
};

const deleteImage = (imagePath) => new Promise((resolve, reject) => {
    fs.unlink(imagePath, (err) => {
        if (err) {
            reject(err);
        }
        resolve();
    });
});

module.exports = {
    fetchImage,
    deleteImage,
};
