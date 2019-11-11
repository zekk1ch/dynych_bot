const util = require('./util');
const parser = require('./parser');

parser.parseEmojis();

const emojis = require('./collections/emojis');
const animatedEmojis = require('./collections/animatedEmojis');
const facepalmEmojis = require('./collections/facepalmEmojis');

const getRandomEmoji = (collection = emojis) => util.getRandomArrayItem(Object.values(collection));

module.exports = {
    ...emojis,
    animatedEmojis,
    facepalmEmojis,
    getRandomEmoji,
};
