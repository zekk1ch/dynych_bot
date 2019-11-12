const Promise = require('bluebird');
const telegramService = require('./services/telegram/service');
const youtubeService = require('./services/youtube/service');
const admemService = require('./services/admem/service');
const emojis = require('./emojis');

const router = async (req, res) => {
    try {
        const options = telegramService.parseRequest(req);

        if (options.action === 'message') {
            const hasValidYoutubeUrl = options.entities.findIndex((entity) => youtubeService.isValidUrl(entity.value)) !== -1;

            if (hasValidYoutubeUrl) {
                const text = 'В каком формате сохранить видос?';
                const replyMarkup = { inline_keyboard: [[
                    {text: 'Аудио', callback_data: 'audio'},
                    {text: 'Видео', callback_data: 'video'},
                ]]};
                await telegramService.sendText(options.chatId, text, { replyMarkup, replyToMessageId: options.messageId });
            } else if (options.text === '/meme') {
                await Promise.all([
                    Promise.method(async () => {
                        const imageUrl = await admemService.getRandomMemeUrl();
                        await telegramService.sendImage(options.chatId, imageUrl);
                    })().reflect(),
                    Promise.resolve(telegramService.deleteMessage(options.chatId, options.messageId)).reflect(),
                ]).then((results) => {
                    if (results[0].isRejected()) {
                        throw results[0].reason();
                    }
                });
            } else {
                await telegramService.sendText(options.chatId, emojis.getRandomEmoji(emojis.facepalmEmojis))
            }
        }
        if (options.action === 'callback') {
            const audioOnly = options.callbackData === 'audio';
            const telegramAction = audioOnly ? 'sendAudio' : 'sendVideo';
            const { value: youtubeUrl } = options.replyEntities.find((entity) => youtubeService.isValidUrl(entity.value));
            const { fileUrl, metadata } = await youtubeService.getDownloadUrl(youtubeUrl, audioOnly);

            await Promise.all([
                Promise.resolve(telegramService[telegramAction](options.chatId, fileUrl, metadata)).reflect(),
                Promise.resolve(telegramService.answerCallback(options.chatId, options.callbackId)).reflect(),
            ]).then(async (results) => {
                if (results[0].isRejected()) {
                    const err = results[0].reason();
                    console.error(err);

                    const text = err.error_code === 413
                        ? `Файл получился слишком большой...\nВот рабочая <a href="${fileUrl}">ссылка</a> ${emojis.SHUSHING_FACE}`
                        : `Уупс...\nЧто-то пошло не так ${emojis.THINKING_FACE}\nВот рабочая <a href="${fileUrl}">ссылка</a>`;
                    await telegramService.sendText(options.chatId, text);
                }
            });
        }

        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
};

const keepAlive = async (req, res) => {
    const intervalId = setInterval(() => {
        res.write();
    }, 25000);

    try {
        await router(req, res);
    } finally {
        clearInterval(intervalId);
    }
};

module.exports = keepAlive;
