const emojis = require('../emojis');

const keys = Object.keys(emojis);
const values = Object.values(emojis);
const totalCount = keys.length;
const totalDigits = totalCount.toString().length;

const getRandomEmoji = () => {
    const randomNumber = Math.floor(Math.random() * Number(`1${'0'.repeat(totalDigits)}`));
    const index = randomNumber % totalCount;

    return values[index];
};

module.exports = {
    getRandomEmoji,
};
