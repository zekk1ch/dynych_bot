const schedule = require('node-schedule');
const constants = require('./constants');
const util = require('./util');
const emojis = require('../../emojis');
const telegramService = require('../../services/telegram/service');
const youtubeService = require('../../services/youtube/service');
const admemService = require('../../services/admem/service');

const deleteMessage = (chatId, messageId, timeout) => {
    const fn = () => util.fireAndForget(telegramService.deleteMessage, chatId, messageId);

    if (typeof timeout === 'number') {
        schedule.scheduleJob(new Date(Date.now() + timeout), fn);
    } else {
        fn();
    }
};

const sendDefaultResponse = async (chatId) => {
    const text = emojis.getRandomFacepalmEmoji();
    const response = await telegramService.sendText(chatId, text);
    deleteMessage(chatId, response.result.message_id, constants.CLEANUP_TIMEOUT);
};

const sendRandomMeme = async (chatId, messageId) => {
    let fileData;
    try {
        fileData = await admemService.getRandomDownloadFile();
    } catch (err) {
        console.error(err);
        const response = await telegramService.sendText(chatId, `Сервер с мемчиками не отвечает... ${emojis.FACE_SCREAMING_IN_FEAR}`);
        deleteMessage(chatId, messageId);
        deleteMessage(chatId, response.result.message_id, constants.CLEANUP_TIMEOUT);
        return;
    }

    await telegramService.sendImage(chatId, fileData);
    deleteMessage(chatId, messageId);
};

const sendYoutubeFormatPicker = async (chatId, replyToMessageId) => {
    const text = 'В каком формате сохранить видос?';
    const replyMarkup = { inline_keyboard: [[
        {text: 'Аудио', callback_data: 'audio'},
        {text: 'Видео', callback_data: 'video'},
    ]]};
    await telegramService.sendText(chatId, text, { replyMarkup, replyToMessageId });
};

const sendYoutubeFile = async (chatId, messageId, replyMessageId, youtubeUrl, audioOnly) => {
    let youtubeData;
    try {
        youtubeData = await youtubeService.getDownloadFile(youtubeUrl, audioOnly);
    } catch (err) {
        console.error(err);
        const response = await telegramService.sendText(chatId, `Не получилось скачать видосик... ${emojis.FACE_SCREAMING_IN_FEAR.repeat(3)}`);
        deleteMessage(chatId, response.result.message_id, constants.CLEANUP_TIMEOUT);
        return;
    }
    const { metadata, ...fileData } = youtubeData;

    try {
        const action = audioOnly ? 'sendAudio' : 'sendVideo';
        await telegramService[action](chatId, fileData, metadata);
    } catch (err) {
        console.error(err);
        const text = err.error_code === 413
            ? `Файл получился слишком большой...\nВот рабочая <a href="${fileData.fileUrl}">ссылка</a> ${emojis.SHUSHING_FACE}`
            : `Уупс...\nЧто-то пошло не так ${emojis.THINKING_FACE}\nВот рабочая <a href="${fileData.fileUrl}">ссылка</a>`;
        const response = await telegramService.sendText(chatId, text);
        deleteMessage(chatId, response.result.message_id, constants.YOUTUBE_LINK_EXPIRE_TIMEOUT);
        return;
    }

    deleteMessage(chatId, messageId);
    deleteMessage(chatId, replyMessageId);
};

module.exports = {
    sendDefaultResponse,
    sendRandomMeme,
    sendYoutubeFormatPicker,
    sendYoutubeFile,
};
