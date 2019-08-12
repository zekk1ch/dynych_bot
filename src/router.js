const express = require('express');
const telegramService = require('./services/telegramService');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { message, chatId } = telegramService.parse(req.body);

        switch (message) {
            case '/meme':
                await telegramService.sendRandomMeme(chatId);
                break;
            case '/joke':
            case '/test':
                await telegramService.sendText(chatId);
                break;
            default:
                res.status(400).send('Me no understand what say you...');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Opps... Try again');
    }
});

module.exports = router;
