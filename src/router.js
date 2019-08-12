const express = require('express');
const telegramService = require('./services/telegramService');
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
        const { command, chatId } = telegramService.flatten(req.body);

        switch (command) {
            case '/meme':
                await telegramService.sendRandomMeme(chatId);
                return res.send('ok');
            case '/test':
                await telegramService.sendText(chatId);
                return res.send('ok');
            default:
                return res.status(400).send('Нипанимаю брат чьто ты гавариш...');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Нипалучилось...');
    }
});

module.exports = router;
