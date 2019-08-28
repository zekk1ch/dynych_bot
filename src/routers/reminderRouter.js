const express = require('express');
const reminderService = require('../services/reminderService');
const telegramService = require('../services/telegramService');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const chat = await reminderService.saveReminder(req.body, telegramService.sendReminder);
        res.send(chat);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;
