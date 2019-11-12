const schedule = require('node-schedule');
const util = require('./util');
const emojis = require('./emojis');
const telegramService = require('./services/telegram/service');
const youtubeService = require('./services/youtube/service');
const admemService = require('./services/admem/service');

const router = async (req, res) => {
    res.end();

    try {
        const options = telegramService.parseRequest(req);

        if (options.action === 'message') {
            const hasValidYoutubeUrl = options.entities.findIndex((entity) => youtubeService.isValidUrl(entity.value)) !== -1;
            const hasMemeCommand = options.entities.findIndex((entity) => entity.value === '/meme') !== -1;

            if (hasValidYoutubeUrl) {
                const text = 'В каком формате сохранить видос?';
                const replyMarkup = { inline_keyboard: [[
                    {text: 'Аудио', callback_data: 'audio'},
                    {text: 'Видео', callback_data: 'video'},
                ]]};
                await telegramService.sendText(options.chatId, text, { replyMarkup, replyToMessageId: options.messageId });
            } else if (hasMemeCommand) {
                const imageUrl = await admemService.getRandomMemeUrl();
                await telegramService.sendImage(options.chatId, imageUrl);

                util.muteErrors(telegramService.deleteMessage)(options.chatId, options.messageId);
            } else {
                const response = await telegramService.sendText(options.chatId, emojis.getRandomEmoji(emojis.facepalmEmojis));

                schedule.scheduleJob(new Date(Date.now() + 600000), util.muteErrors(telegramService.deleteMessage).bind(null, options.chatId, response.result.message_id));
            }
        }
        if (options.action === 'callback') {
            const audioOnly = options.callbackData === 'audio';
            const { value: youtubeUrl } = options.replyEntities.find((entity) => youtubeService.isValidUrl(entity.value));
            const { fileUrl, metadata } = await youtubeService.getDownloadUrl(youtubeUrl, audioOnly);

            try {
                const action = audioOnly ? 'sendAudio' : 'sendVideo';
                await telegramService[action](options.chatId, fileUrl, metadata);

                util.muteErrors(telegramService.deleteMessage)(options.chatId, options.messageId);
                util.muteErrors(telegramService.deleteMessage)(options.chatId, options.replyMessageId);
            } catch (err) {
                console.error(err);
                const text = err.error_code === 413
                    ? `Файл получился слишком большой...\nВот рабочая <a href="${fileUrl}">ссылка</a> ${emojis.SHUSHING_FACE}`
                    : `Уупс...\nЧто-то пошло не так ${emojis.THINKING_FACE}\nВот рабочая <a href="${fileUrl}">ссылка</a>`;
                const response = await telegramService.sendText(options.chatId, text);

                schedule.scheduleJob(new Date(Date.now() + 21600000), util.muteErrors(telegramService.deleteMessage).bind(null, options.chatId, response.result.message_id)); // 6 hours --> expiration time of generated YouTube links
            }
        }
    } catch (err) {
        console.error(err);
    }
};

module.exports = router;
