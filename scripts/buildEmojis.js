const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const env = require('../env');
const constants = require('../src/emojis/constants');
const src = require('../src/emojis/collections/src');
const timerLabel = 'Emojis successfully built in';
fs.writeFileAsync = promisify(fs.writeFile);

console.time(timerLabel);

const {
    emojis,
    animatedEmojis,
    facepalmEmojis,
    duplicates,
} = parseEmojis(src);

Promise.all([
    writeEmojis(emojis, 'emojis'),
    writeEmojis(animatedEmojis, 'animatedEmojis'),
    writeEmojis(facepalmEmojis, 'facepalmEmojis'),
]).then(() => {
    console.timeEnd(timerLabel);

    if (duplicates.length) {
        console.error(`${duplicates.length} emojis were overwritten by duplicates with the same name`);
        if (env.MODE !== constants.MODE_PRODUCTION) {
            console.error(duplicates);
        }
    }
});



function parseEmojis(src) {
    let result = {
        emojis: {},
        duplicates: [],
        animatedEmojis: {},
        facepalmEmojis: {},
    };

    for (let { name, char } of src) {
        const code = name
            .replace(/[:&."!]|\(.+\)/g, '')
            .replace(/\*/g, 'STAR')
            .replace(/#/g, 'NUMBER')
            .replace(/ +|-/g, '_')
            .toUpperCase();

        // duplicates seem to differ only by "FE0F" code — so no need to worry about those... I hope...
        if (result.emojis[code]) {
            result.duplicates.push(name);
        }

        result.emojis[code] = char;

        if (constants.ANIMATED_EMOJI_NAMES.includes(name)) {
            result.animatedEmojis[code] = char;
        }

        if (/facepalm/i.test(name)) {
            result.facepalmEmojis[code] = char;
        }
    }

    return result;
}

// TODO: how to access the "name" property of an object literal
function writeEmojis(emojis, objectName) {
    return fs.writeFileAsync(path.resolve(constants.ROOT_PATH, 'src', 'emojis', 'collections', `${objectName}.json`), JSON.stringify(emojis));
}
