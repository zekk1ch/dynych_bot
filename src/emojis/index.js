const util = require('./util');
const parser = require('./parser');

parser.parseEmojis();

const emojis = require('./collections/emojis');
const animatedEmojis = require('./collections/animatedEmojis');
const facepalmEmojis = require('./collections/facepalmEmojis');

const getRandomEmoji = () => util.getRandomArrayItem(Object.values(emojis));
const getRandomAnimatedEmoji = () => util.getRandomArrayItem(Object.values(animatedEmojis));
const getRandomFacepalmEmoji = () => util.getRandomArrayItem(Object.values(facepalmEmojis));

module.exports = {
    ...emojis,
    animatedEmojis,
    facepalmEmojis,
    getRandomEmoji,
    getRandomAnimatedEmoji,
    getRandomFacepalmEmoji,
};
