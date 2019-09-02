const express = require('express');
const telegramService = require('../services/telegramService');
const emojiService = require('../services/emojiService');
const util = require('../services/utilService');
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
    const { command, params, chatId, messageId, replyMessageId, callbackId } = req.telegram;

    try {
        switch (command) {
            case '/start':
                await telegramService.createChat(chatId);
                break;
            case '/echo':
                const echo = params || emojiService.getRandomEmoji(emojiService.movingEmojis);
                await telegramService.sendText(chatId, echo);
                break;
            case '/meme':
                await telegramService.sendRandomMeme(chatId);
                break;
            case '/shuffle_memes':
                await telegramService.randomizeMemeUrls(chatId);
                break;
            case '/save_from_youtube':
                await telegramService.saveFromYoutube(chatId, messageId, params);
                break;
            case '/video':
                await telegramService.sendVideo(chatId, params, { callbackId, replyMessageId } );
                break;
            case '/audio':
                await telegramService.sendAudio(chatId, params, { callbackId, replyMessageId });
                break;
            case '/reminder':
                await telegramService.setReminder(chatId);
                break;
            case '/game':
                await telegramService.sendGame(chatId, callbackId);
                break;
            default:
                await telegramService.sendText(chatId, emojiService.getRandomEmoji(emojiService.facepalmEmojis));
        }

        res.send('ok');
    } catch (err) {
        console.log(err);
        const errorMessage = util.explainError(err);

        try {
            await telegramService.sendText(chatId, `Ошибочка... ${emojiService.emojis.THINKING_FACE}\n\n${errorMessage}`);

            res.send('ok ok');
        } catch {
            return res.status(500).send(`${emojiService.emojis.CONFUSED_FACE} not ok`);
        }
    }
});

module.exports = router;
