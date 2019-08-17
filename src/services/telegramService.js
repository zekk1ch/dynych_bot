const fs = require('fs');
const FormData = require('form-data');
const memeService = require('./memeService');
const imageService = require('./imageService');
const emojiService = require('./emojiService');
const util = require('./utilService');
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

const flatterRequestBody = (body = {}) => {
    let action, messageId, chatId, command, from, chat;

    if (body.message) {
        action = 'message';
    }

    switch (action) {
        case 'message':
            command = body.message.text.trim();
            messageId = body.message.message_id;
            chatId = body.message.chat.id;
            from = body.message.from;
            chat = body.message.chat;
    }

    return { action, command, messageId, chatId, from, chat };
};

const sendStatus = (chatId, status) => {
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
    return util.makeRequest(constants.telegramUrl + '/sendChatAction', options);
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
    return util.makeRequest(constants.telegramUrl + '/sendMessage', options);
};

const sendRandomMeme = async (chatId) => {
    await sendStatus(chatId, statusTypes.uploadPhoto);

    const memeUrl = await memeService.getRandomMemeUrl();
    const imagePath = await imageService.fetchImage(memeUrl);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('photo', fs.createReadStream(imagePath));

    const options = {
        method: 'POST',
        body: form,
    };
    await util.makeRequest(constants.telegramUrl + '/sendPhoto', options);

    await imageService.deleteImage(imagePath);
};

module.exports = {
    flatterRequestBody,
    sendText,
    sendRandomMeme,
};
