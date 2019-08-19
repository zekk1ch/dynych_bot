const fs = require('fs');
const FormData = require('form-data');
const chatService = require('./chatService');
const imageService = require('./imageService');
const emojiService = require('./emojiService');
const util = require('./utilService');
const models = require('../models');
const constants = require('../constants');
const emojis = require('../emojis');
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
    let action, messageId, chatId, command, from, chat;

    if (body.message) {
        action = 'message';
    }

    switch (action) {
        case 'message':
            command = body.message.text;
            messageId = body.message.message_id;
            chatId = body.message.chat.id;
            from = body.message.from;
            chat = body.message.chat;
    }

    return { action, command, messageId, chatId, from, chat };
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

    const memeUrl = await chatService.getMemeUrl(chatId);
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
    await chatService.incrementMemeUrl(chatId);
};

const createChat = async (chatId) => {
    const chat = await models.Chat.findByPk(chatId);
    if (chat) {
        await sendText(chatId, 'О, привет! А я тебя помню)');
        await sendText(chatId, util.getRandomArrayItem(Object.values(emojiService.movingEmojis)));
        return;
    }

    await chatService.createChat(chatId);

    await sendText(chatId, `Приветик ${emojiService.getRandomEmoji()}`);
    await sendText(chatId, util.getRandomArrayItem(Object.values(emojiService.movingEmojis)));
};

const randomizeMemeUrls = async (chatId) => {
    await chatService.randomizeMemeUrls(chatId);
    await sendText(chatId, emojis.OK_HAND);
};

module.exports = {
    flattenRequestBody,
    sendText,
    sendRandomMeme,
    createChat,
    randomizeMemeUrls,
};
