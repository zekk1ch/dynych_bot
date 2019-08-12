const memeService = require('./imageService');
const util = require('./utilService');
const constants = require('../constants');

const parse = (body) => {
    try {
        return {
            chatId: body.message.chat.id,
            message: body.message.text.trim(),
        };
    } catch (err) {
        console.log(err);
        throw new Error('Failed to parse command from message body');
    }
};

const sendText = async (chat_id, text = '¯\\_(ツ)_/¯') => {
    try {
        await util.makeRequest(constants.telegramUrl + '/sendMessage', 'POST', { chat_id, text });
    } catch (err) {
        console.log(err);
    }
};

const sendRandomMeme = async (chat_id) => {
    try {
        const photo = await memeService.getRandomMemeUrl();
        await util.makeRequest(constants.telegramUrl + '/sendPhoto', 'POST', { chat_id, photo });
    } catch (err) {
        console.log(err);
        sendText('Нимагу найти ничего смешного, сорян братик :heart:');
    }
};

module.exports = {
    parse,
    sendRandomMeme,
    sendText,
};
