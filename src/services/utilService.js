const path = require('path');
const fetch = require('node-fetch');
const emojiService = require('./emojiService');

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

const getMetadata = (filePath) => {
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

module.exports = {
    explainError,
    makeRequest,
    sleep,
    getRandomString,
    getRandomArrayItem,
    randomizeArray,
    getMetadata,
};
