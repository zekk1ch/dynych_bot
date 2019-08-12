module.exports = {
    telegramUrl: process.env.TELEGRAM_BOT_URL || 'http://example.com/fake-bot',
    memeUrlsUrl: `${process.env.MEME_SERVER_URL || 'http://example.com'}${process.env.MEME_URLS_PATH || '/meme-urls-path'}`,
    memeUrl: `${process.env.MEME_SERVER_URL || 'http://example.com'}${process.env.MEME_PATH || '/meme-path'}`,
};
