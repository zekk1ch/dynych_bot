const fs = require('fs');
const FormData = require('form-data');
const util = require('./utilService');
const constants = require('../constants');
const emojis = require('../emojis');

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

const sendText = async (chatId, text = '¯\\_(ツ)_/¯') => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text,
        }),
    };
    return util.makeRequest(constants.telegramUrl + '/sendMessage', options);
};

const sendRandomMeme = async (chatId) => {
    // const memeUrl = await memeService.getRandomMemeUrl();
    // const imagePath = await imageService.fetchImage(memeUrl);
    const imagePath = '/home/user/Work/Projects/dynych_bot/images/1390975853.jpg';

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('photo', fs.createReadStream(imagePath));

    fetch(constants.telegramUrl + '/sendPhoto', { method: 'POST', body: form })
        .then(function(res) {
            return res.json();
        }).then(function(json) {
            console.log(json);
        });


    // setTimeout(() => imageService.deleteImageSilent(imagePath), 100); // immediate call to this function throws an UNCATCHABLE error
};

module.exports = {
    flatterRequestBody,
    sendRandomMeme,
    sendText,
};
