const memeService = require('./imageService');
const util = require('./utilService');
const constants = require('../constants');

const getRandomMemeUrl = () => memeService.getRandomMemeUrl();

const sendMessage = async (text = '¯\\_(ツ)_/¯') => {
    const body = {
        // chat_id: message.chat.id,
        chat_id: 364204785,
        text: '¯\\_(ツ)_/¯',
    };
    try {
        const data = await util.makeRequest(constants.telegramUrl, 'POST', body);

        console.log('\n\nA message back was sent!\n\n');
        console.log(data);
    } catch (err) {
        console.log('\n\nFailed to send a message back\n\n');
        console.log(err);
    }
};

module.exports = {
    getRandomMemeUrl,
    sendMessage,
};
