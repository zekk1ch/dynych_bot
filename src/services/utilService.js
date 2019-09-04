const fs = require('fs');
const path = require('path');
const util = require('util');
const fetch = require('node-fetch');
const emojiService = require('./emojiService');

const deleteFile = util.promisify(fs.unlink);
const fileStats = util.promisify(fs.stat);
const renameFile = util.promisify(fs.rename);

const explainError = (err) => {
    let message = emojiService.emojis.GRIMACING_FACE;

    if (err instanceof Error) {
        if (err.message) {
            message = err.message;
        }
    } else if (typeof err === 'object') {
        if (err.description) {
            message = err.description;
        } else {
            message = JSON.stringify(err);
        }
    }

    return message;
};

const makeRequest = async (url, options) => {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        throw data;
    }
};

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomNumber = (max) => {
    const maxDigits = max.toString().length;
    const randomNumber = Math.floor(Math.random() * Number(`1${'0'.repeat(maxDigits)}`));
    return randomNumber % max;
};

const getRandomString = () => Math.random().toString().slice(2);

const getRandomArrayItem = (array) => {
    const randomIndex = getRandomNumber(array.length);
    return array[randomIndex];
};

const randomizeArray = (array) => {
    const src = array.slice();
    const randomized = [];

    while(src.length) {
        const randomIndex = getRandomNumber(src.length);
        randomized.push(...src.splice(randomIndex, 1));
    }

    return randomized;
};

const incrementFileName = (fileName) => {
    const splitted = fileName.slice().split('.');

    let name, format = '';
    if (splitted.length > 1) {
        format = '.' + splitted.pop();
        name = splitted.join('.');
    } else {
        name = fileName;
    }

    let part = name.match(/__part_[-+]?(?<number>\d+)$/);
    if (part) {
        part = Number(part.groups.number) + 1;
        name = name.replace(/__part_[-+]?\d+$/, '');
    } else {
        part = 1;
    }

    return `${name}__part_${part}${format}`;
};

const parseMetadataYoutube = (info = {}) => {
    const replaceRegex = /[?'"%!@#^&]+/g;

    return {
        title: typeof info.title === 'string' ? info.title.replace(replaceRegex, '') : '',
        category: typeof info.category === 'string' ? info.category.replace(replaceRegex, '') : '',
        track: typeof info.song === 'string' ? info.song.replace(replaceRegex, '') : '',
        artist: typeof info.artist === 'string' ? info.artist.replace(replaceRegex, '') : '',
        album: typeof info.album === 'string' ? info.album.replace(replaceRegex, '') : '',
    };
};
const parseMetadataMpeg = (mpeg = {}) => ({
    title: mpeg.title || '',
    track: mpeg.track || '',
    artist: mpeg.artist || '',
    album: mpeg.album || '',
});
const getMetadataFromFilename = (filePath) => {
    const delimiter = ' - ';
    let title, performer;

    const fileName = path.basename(filePath).replace(/\..+$/i, '');
    if (fileName.includes(delimiter)) {
        const splitted = fileName.split(delimiter);
        performer = splitted[0];
        title = splitted.slice(1).join(delimiter);
    } else {
        performer = 'dynych_bot';
        title = fileName;
    }

    return { title, performer };
};
const convertMetadataToString = (metadata) => {
    let res = '';
    Object.entries(metadata).forEach(([key, value]) => {
        if (value) {
            res += `-metadata ${key}="${value}" `;
        }
    });
    return res ? res.slice(10, -1) : '';
};

module.exports = {
    deleteFile,
    fileStats,
    renameFile,
    explainError,
    makeRequest,
    sleep,
    getRandomString,
    getRandomArrayItem,
    randomizeArray,
    incrementFileName,
    parseMetadataYoutube,
    parseMetadataMpeg,
    getMetadataFromFilename,
    convertMetadataToString,
};
