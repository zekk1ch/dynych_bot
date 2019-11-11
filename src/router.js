const telegramService = require('./services/telegram/service');
const youtubeService = require('./services/youtube/service');
const admemService = require('./services/admem/service');
const emojis = require('./emojis');

const router = async (req, res) => {
    try {
        const options = telegramService.parseRequest(req);

        if (options.action === 'message') {
            const validYoutubeUrl = options.entities.find((entity) => youtubeService.isValidUrl(entity.value));
            if (validYoutubeUrl) {
                const text = 'В каком формате сохранить видос?';
                const replyMarkup = { inline_keyboard: [[
                        {text: 'Аудио', callback_data: 'audio'},
                        {text: 'Видео', callback_data: 'video'},
                    ]]};
                await telegramService.sendText(options.chatId, text, { replyMarkup, replyToMessageId: options.messageId });
                return res.end();
            }

            if (options.text === '/meme') {
                const randomMemeUrl = await admemService.getRandomMemeUrl();
                await telegramService.sendImage(options.chatId, randomMemeUrl);
                try {
                    await telegramService.deleteMessage(options.chatId, options.messageId);
                } catch {}
                return res.end();
            }

            await telegramService.sendText(options.chatId, emojis.getRandomEmoji(emojis.facepalmEmojis));
            return res.end();
        }
        if (options.action === 'callback') {
            const { value: youtubeUrl } = options.replyEntities.find((entity) => youtubeService.isValidUrl(entity.value));
            const { fileUrl, metadata } = await youtubeService.getDownloadUrl(youtubeUrl, options.callbackData === 'audio');

            try {
                const action = options.callbackData === 'video' ? 'sendVideo' : 'sendAudio';
                await telegramService[action](options.chatId, fileUrl, metadata);
                try {
                    await telegramService.deleteMessage(options.chatId, options.messageId);
                } catch {}
                return res.end();
            } catch (e) {
                console.error(e);
                const text = e.error_code === 4131
                    ? `Файл получился слишком большой...\nВот рабочая <a href="${fileUrl}">ссылка</a> ${emojis.SHUSHING_FACE}`
                    : `Уупс...\nЧто-то пошло не так ${emojis.THINKING_FACE}\nВот рабочая <a href="${fileUrl}">ссылка</a>`;
                await telegramService.sendText(options.chatId, text);
                return res.end();
            }
        }
    } catch (err) {
        console.error(err);
        return res.status(500).end();
    }
};

module.exports = router;
