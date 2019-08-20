const util = require('./utilService');
const emojis = require('../emojis');

const movingEmojis = {
    RED_HEART: emojis['RED_HEART'],
    THUMBS_UP: emojis['THUMBS_UP'],
    UNAMUSED_FACE: emojis['UNAMUSED_FACE'],
    FLUSHED_FACE: emojis['FLUSHED_FACE'],
    PARTYING_FACE: emojis['PARTYING_FACE'],
};

const getRandomEmoji = () => util.getRandomArrayItem(Object.values(emojis));

const getRandomMovingEmoji = () => util.getRandomArrayItem(Object.values(movingEmojis));

module.exports = {
    emojis,
    movingEmojis,
    getRandomEmoji,
    getRandomMovingEmoji,
};
