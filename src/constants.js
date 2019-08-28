const path = require('path');
const env = require('../env');

module.exports = {
    rootPath: path.dirname(path.dirname((require.main.filename))),
    telegramUrl: env.TELEGRAM_BOT_URL || 'http://example.com/fake-bot',
    gameName: env.GAME_NAME || 'telegram_game_short_name',
    gameUrl: env.GAME_URL || 'http://example.com/html5-game',
    memeUrlsUrl: `${env.MEME_SERVER_URL || 'http://example.com'}${env.MEME_URLS_PATH || '/meme-urls-path'}`,
    memeUrl: `${env.MEME_SERVER_URL || 'http://example.com'}${env.MEME_PATH || '/meme-path'}`,
    memeAuthCookie: env.MEME_AUTH_COOKIE || '',
    masterTypes: {
        MEME_URLS: 'MEME_URLS',
    },
    ms: {
        hour: 1000 * 60 * 60,
    },
};
