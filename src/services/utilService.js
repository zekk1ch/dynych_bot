const fs = require('fs');
const util = require('util');
const fetch = require('node-fetch');
const emojis = require('../emojis');

const explainError = (err) => {
    let message = emojis.GRIMACING_FACE;

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

const getRandomNumber = (max) => {
    const maxDigits = max.toString().length;
    const randomNumber = Math.floor(Math.random() * Number(`1${'0'.repeat(maxDigits)}`));
    return randomNumber % max;
};

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

module.exports = {
    deleteFile: util.promisify(fs.unlink),
    explainError,
    makeRequest,
    getRandomArrayItem,
    randomizeArray,
};
