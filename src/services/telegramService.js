const memeService = require('./imageService');
const util = require('./utilService');
const constants = require('../constants');

const flatten = (body = {}) => {
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

const sendText = async (chat_id, text = '¯\\_(ツ)_/¯') => {
    try {
        await util.makeRequest(constants.telegramUrl + '/sendMessage', 'POST', { chat_id, text });
    } catch (err) {
        console.error(err);
    }
};

const sendRandomMeme = async (chat_id) => {
    try {
        const photo = await memeService.getRandomMemeUrl();
        await util.makeRequest(constants.telegramUrl + '/sendPhoto', 'POST', { chat_id, photo });
    } catch (err) {
        console.error(err);
        sendText('Нимагу найти ничего смешного, сорян братик :heart:');
    }
};

module.exports = {
    flatten,
    sendRandomMeme,
    sendText,
};
