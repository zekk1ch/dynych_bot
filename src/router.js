const express = require('express');
const telegramService = require('./services/telegramService');
const emojiService = require('./services/emojiService');
const util = require('./services/utilService');
const router = express.Router();

router.use((req, res, next) => {
    if (!Object.entries(req.body).length) {
        console.log('\n\n::: Empty body! Aborting request! :::\n\n');
        return res.send('ok');
    }

    next();
});

router.post('/', async (req, res) => {
    try {
        const { command, chatId } = telegramService.flattenRequestBody(req.body);

        switch (command) {
            case '/start':
                await telegramService.createChat(chatId);
                break;
            case '/meme':
                await telegramService.sendRandomMeme(chatId);
                break;
            case '/shuffle':
                await telegramService.randomizeMemeUrls(chatId);
                break;
            default:
                await telegramService.sendText(chatId, emojiService.getRandomEmoji());
        }

        res.send('ok');
    } catch (err) {
        console.log(err);
        const { statusCode, message } = util.explainError(err);
        res.status(statusCode).send(message);
    }
});

module.exports = router;
