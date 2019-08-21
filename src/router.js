const express = require('express');
const telegramService = require('./services/telegramService');
const emojiService = require('./services/emojiService');
const router = express.Router();

router.use((req, res, next) => {
    try {
        req.telegram = telegramService.flattenRequestBody(req.body);

        next();
    } catch (err) {
        console.log(err);
        res.send(`${emojiService.emojis.CONFUSED_FACE} not ok though`);
    }
});

router.post('/', async (req, res) => {
    const { command, params, chatId } = req.telegram;

    try {
        switch (command) {
            case '/start':
                await telegramService.createChat(chatId);
                break;
            case '/echo':
                const echo = params || emojiService.getRandomMovingEmoji();
                await telegramService.sendText(chatId, echo);
                break;
            case '/meme':
                await telegramService.sendRandomMeme(chatId);
                break;
            case '/shuffle_memes':
                await telegramService.randomizeMemeUrls(chatId);
                break;
            case '/save_from_youtube':
                await telegramService.saveFromYoutube(chatId, params);
                break;
            case '/video':
                await telegramService.sendVideo(chatId, params);
                break;
            case '/audio':
                await telegramService.sendAudio(chatId, params);
                break;
            default:
                await telegramService.sendText(chatId, emojiService.getRandomEmoji());
        }

        res.send('ok');
    } catch (err) {
        console.log(err);

        try {
            await telegramService.sendText(chatId, `Ошибочка... ${emojiService.emojis.ANGRY_FACE}\n\n${err.message || ''}`);

            res.send('ok ok');
        } catch {
            return res.status(500).send(`${emojiService.emojis.CONFUSED_FACE} not ok`);
        }
    }
});

module.exports = router;
