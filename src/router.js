const express = require('express');
const telegramService = require('./services/telegramService');
const router = express.Router();

router.post('/', async (req, res) => {
    let { message } = req.body;
    if (typeof message === 'string') {
        message = message.trim();
    }

    try {
        switch (message) {
            case '/meme':
                const memeUrl = await telegramService.getRandomMemeUrl();
                await telegramService.sendMessage();
                return res.status(301).redirect(memeUrl);
            case '/joke':
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Opps... Try again');
    }

    res.status(400).send('Me no understand what say you...');
});

module.exports = router;
