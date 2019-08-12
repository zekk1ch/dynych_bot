const memeService = require('./imageService');

const getRandomMemeUrl = () => memeService.getRandomMemeUrl();

module.exports = {
    getRandomMemeUrl,
};
