const fs = require('fs');
const FormData = require('form-data');
const chatService = require('./chatService');
const mediaService = require('./mediaService');
const emojiService = require('./emojiService');
const util = require('./utilService');
const models = require('../models');
const constants = require('../constants');
const statusTypes = {
    typing: 'typing',
    uploadPhoto: 'upload_photo',
    uploadAudio: 'upload_audio',
    uploadVideo: 'upload_video',
    uploadVideoNote: 'upload_video_note',
    uploadDocument: 'upload_document',
    findLocation: 'find_location',
};

const flattenRequestBody = (body = {}) => {
    let action, data;

    if (body.message) {
        action = 'message';
        data = body.message;
    }
    if (!action) {
        throw new Error('Unknown action');
    }

    const text = data.text;
    const matched = text.match(/(?<command>\/[a-z_0-9]+) +(?<params>.+)?/i) || { groups: {} };
    const { command = null, params = null } = matched.groups;

    return {
        action,
        messageId: data.message_id,
        chatId: data.chat.id,
        command,
        params,
        text,
        from: data.from,
        chat: data.chat,
    };
};

const sendStatus = async (chatId, status) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            action: status,
        }),
    };
    await util.makeRequest(constants.telegramUrl + '/sendChatAction', options);
};

const sendText = async (chatId, text) => {
    await sendStatus(chatId, statusTypes.typing);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text || emojiService.getRandomEmoji(),
        }),
    };
    await util.makeRequest(constants.telegramUrl + '/sendMessage', options);
};

const sendRandomMeme = async (chatId) => {
    await sendStatus(chatId, statusTypes.uploadPhoto);

    const url = await chatService.getMemeUrl(chatId);
    const filePath = await mediaService.fetchImage(url);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('photo', fs.createReadStream(filePath));

    const options = {
        method: 'POST',
        body: form,
    };
    await util.makeRequest(constants.telegramUrl + '/sendPhoto', options);

    await chatService.incrementMemeUrl(chatId);
    await mediaService.deleteFile(filePath);
};

const createChat = async (chatId) => {
    await sendStatus(chatId, statusTypes.typing);

    const chat = await models.Chat.findByPk(chatId);
    if (chat) {
        await sendText(chatId, 'О, привет! А я тебя помню)');
        await sendText(chatId, emojiService.getRandomMovingEmoji());
        return;
    }

    await chatService.createChat(chatId);

    await sendText(chatId, 'Приветик)');
    await sendText(chatId, emojiService.getRandomMovingEmoji());
};

const randomizeMemeUrls = async (chatId) => {
    await sendStatus(chatId, statusTypes.typing);
    await chatService.randomizeMemeUrls(chatId);
    await sendText(chatId, emojiService.emojis.OK_HAND);
};

const sendVideo = async (chatId, url) => {

    await sendStatus(chatId, statusTypes.uploadVideo);

    const filePath = await mediaService.fetchVideo(url);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('video', fs.createReadStream(filePath));
    form.append('caption', filePath.split('/').pop().replace(/\..+$/i, ''));

    const options = {
        method: 'POST',
        body: form,
    };
    await util.makeRequest(constants.telegramUrl + '/sendVideo', options);

    await mediaService.deleteFile(filePath);
};

const sendAudio = async (chatId, url) => {
    await sendStatus(chatId, statusTypes.uploadAudio);

    const filePath = await mediaService.extractAudio(url);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('audio', fs.createReadStream(filePath));
    form.append('caption', filePath.split('/').pop().replace(/\..+$/i, ''));

    const options = {
        method: 'POST',
        body: form,
    };
    await util.makeRequest(constants.telegramUrl + '/sendAudio', options);

    await mediaService.deleteFile(filePath);
};

module.exports = {
    flattenRequestBody,
    sendText,
    sendRandomMeme,
    createChat,
    randomizeMemeUrls,
    sendVideo,
    sendAudio,
};
