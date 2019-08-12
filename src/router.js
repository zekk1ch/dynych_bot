const express = require('express');
const telegramService = require('./services/telegramService');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const message = telegramService.parseCommand(req.body);

        switch (message) {
            case '/meme':
                await telegramService.sendRandomMeme();
                break;
            case '/joke':
            case '/test':
                await telegramService.sendText();
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
