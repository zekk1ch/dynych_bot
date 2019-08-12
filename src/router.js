const express = require('express');
const telegramService = require('./services/telegramService');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const message = telegramService.parseCommand(req.body);

        switch (message) {
            case '/meme':
                const memeUrl = await telegramService.getRandomMemeUrl();
                return res.status(301).redirect(memeUrl);
            case '/joke':
            case '/test':
                await telegramService.sendMessage();
                return res.send('ok');
            default:
                return res.status(400).send('Me no understand what say you...');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Opps... Try again');
    }
});

module.exports = router;
