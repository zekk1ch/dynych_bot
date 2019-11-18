const util = require('./util');

const getRandomNumber = (max) => {
    let n = Math.random();
    n *= 10**max.toString().length;
    n = ~~n;
    if (n >= max) {
        n %= max;
    }
    return n;
};

const getRandomArrayItem = (array) => {
    const randomIndex = getRandomNumber(array.length);
    return array[randomIndex];
};

module.exports = {
    __proto__: util,
    getRandomArrayItem,
};
