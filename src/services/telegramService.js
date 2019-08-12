const memeService = require('./imageService');
const util = require('./utilService');
const constants = require('../constants');

const getRandomMemeUrl = () => memeService.getRandomMemeUrl();

const sendMessage = async (text = '¯\\_(ツ)_/¯') => {
    console.log('\n\n::: Start sending back a message :::\n\n');
    const body = {
        // chat_id: message.chat.id,
        chat_id: 364204785,
        text: '¯\\_(ツ)_/¯',
    };
    try {
        const data = await util.makeRequest(constants.telegramUrl + '/sendMessage', 'POST', body);

        console.log('\n\n::: A message back was sent! :::\n\n');
        console.log(data);
    } catch (err) {
        console.log('\n\n::: Failed to send a message back :::\n\n');
        console.log(err);
    }
};

const parseCommand = (body) => {
    try {
        return body.message.text.trim();
    } catch (err) {
        console.log(err);
        throw new Error('Failed to parse command from message body');
    }
};

module.exports = {
    parseCommand,
    getRandomMemeUrl,
    sendMessage,
};
