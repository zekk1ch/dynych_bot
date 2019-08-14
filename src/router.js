const express = require('express');
const telegramService = require('./services/telegramService');
const util = require('./services/utilService');
const emojis = require('./emojis');
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
        const { command, chatId } = telegramService.flatterRequestBody(req.body);

        switch (command) {
            case '/meme':
                await telegramService.sendRandomMeme(chatId);
                break;
            case '/test':
                await telegramService.sendText(chatId);
                break;
            default:
                await telegramService.sendText(chatId, `Ниманимаю чьто ты гаваришь братик ${emojis.man_wearing_turban}👳`);
        }

        res.send('ok');
    } catch (err) {
        console.log(err);
        const { statusCode, message } = util.explainError(err);
        res.status(statusCode).send(message);
    }
});

module.exports = router;
