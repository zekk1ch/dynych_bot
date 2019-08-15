// If you're using any type of JetBrains editor — after running this script open the "../src/emojis/index.json" file and press "Ctrl + Alt + L" to prettyPrint
const fs = require('fs');
const src = require('../src/emojis/src');

const emojis = parse(src);
const emojisString = JSON.stringify(emojis);

fs.writeFileSync('../src/emojis/index.json', emojisString);



function parse(src) {
    const duplicates = [];
    const emojis = src.reduce((res, { name, char }) => {
        const code = name
            .replace(/[:&."!]|\(.+\)/g, '')
            .replace(/\*/g, 'STAR')
            .replace(/#/g, 'NUMBER')
            .replace(/ +|-/g, '_')
            .toUpperCase();

        // all the duplicates seem to differ only by "FE0F" code — so no need to worry about those... I hope...
        if (res[code]) {
            duplicates.push(name);
        }

        return {
            ...res,
            [code]: char,
        };
    }, {});

    if (duplicates.length) {
        console.error('Oh no... There were duplicates');
        console.log(duplicates);
    } else {
        console.log('Great! No duplicates');
    }

    return emojis;
}
