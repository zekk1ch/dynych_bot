const fs = require('fs');
const path = require('path');
const env = require('../../env');
const constants = require('./constants');
const src = require('./src');

const parseEmojis = () => {
    let duplicates = [];
    let emojis = {};
    let animatedEmojis = {};
    let facepalmEmojis = {};

    for (let { name, char } of src) {
        const code = name
            .replace(/[:&."!]|\(.+\)/g, '')
            .replace(/\*/g, 'STAR')
            .replace(/#/g, 'NUMBER')
            .replace(/ +|-/g, '_')
            .toUpperCase();

        // duplicates seem to differ only by "FE0F" code — so no need to worry about those... I hope...
        if (emojis[code]) {
            duplicates.push(name);
        }

        emojis[code] = char;
        if (constants.ANIMATED_EMOJI_NAMES.includes(name)) {
            animatedEmojis[code] = char;
        }
        if (/facepalm/i.test(name)) {
            facepalmEmojis[code] = char;
        }
    }

    // very important to save these files synchronously !
    fs.writeFileSync(path.resolve(__dirname, 'collections', 'emojis.json'), JSON.stringify(emojis));
    fs.writeFileSync(path.resolve(__dirname, 'collections', 'animatedEmojis.json'), JSON.stringify(animatedEmojis));
    fs.writeFileSync(path.resolve(__dirname, 'collections', 'facepalmEmojis.json'), JSON.stringify(facepalmEmojis));

    if (env.MODE !== constants.MODE_PRODUCTION && duplicates.length) {
        // console.error('The following emojis were overwritten by duplicates with the same name\n', duplicates);
    }
};

module.exports = {
    parseEmojis,
};
