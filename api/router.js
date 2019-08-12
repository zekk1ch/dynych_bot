const express = require('express');
const constants = require('./constants');
const telegramService = require('./services/telegramService');
const router = express.Router();

router.post('/start_bot', async (req, res) => {
    let { message } = req.body;
    if (typeof message === 'string') {
        message = message.trim();
    }

    try {
        switch (message) {
            case '/meme':
                const memeUrl = await telegramService.getRandomMemeUrl();
                return res.status(301).redirect(memeUrl);
            case '/joke':
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Opps... I dare you to try again');
    }

    res.status(404).send('Me no understand what say you...');
});

module.exports = router;
