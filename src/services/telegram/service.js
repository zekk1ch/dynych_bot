const FormData = require('form-data');
const constants = require('./constants');
const util = require('./util');

const parseEntities = (text, entities) => entities.map((entity) => ({
    type: entity.type,
    value: text.slice(entity.offset, entity.offset + entity.length),
}));
const parseRequest = (req) => {
    let options = {
        action: null,
        messageId: null,
        chatId: null,
        text: '',
        entities: [],
        replyEntities: [],
    };

    if (req.body.hasOwnProperty('message')) {
        options.action = 'message';
        options.messageId = req.body.message.message_id;
        options.chatId = req.body.message.chat.id;
        options.text = req.body.message.text;
        if (req.body.message.hasOwnProperty('entities')) {
            options.entities = parseEntities(req.body.message.text, req.body.message.entities);
        }
    }
    if (req.body.hasOwnProperty('callback_query')) {
        options.action = 'callback';
        options.messageId = req.body.callback_query.message.message_id;
        options.chatId = req.body.callback_query.message.chat.id;
        options.callbackData = req.body.callback_query.data;
        if (req.body.callback_query.message.hasOwnProperty('reply_to_message')) {
            if (req.body.callback_query.message.reply_to_message.hasOwnProperty('entities')) {
                options.replyEntities = parseEntities(req.body.callback_query.message.reply_to_message.text, req.body.callback_query.message.reply_to_message.entities);
            }
        }
    }

    return options;
};

const sendText = async (chatId, text, { replyMarkup, replyToMessageId } = {}) => {
    const options = {
        body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
            reply_to_message_id: replyToMessageId,
        }),
    };
    await util.makeRequest(constants.TELEGRAM_URL_SEND_MESSAGE, options);
};

const sendFile = async (fileType, telegramUrl, chatId, fileUrl, metadata = {}) => {
    const { fileStream, fileSize } = await util.fetchFile(fileUrl);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append(fileType, fileStream, { filename: 'dynych_bot', knownLength: fileSize });
    form.append('title', metadata.track || metadata.title || '');
    form.append('duration', metadata.duration || '');
    form.append('performer', metadata.artist || '');

    const options = {
        headers: form.getHeaders(),
        body: form,
    };
    await util.makeRequest(telegramUrl, options);
};
const sendImage = sendFile.bind(null, 'photo', constants.TELEGRAM_URL_SEND_IMAGE);
const sendAudio = sendFile.bind(null, 'audio', constants.TELEGRAM_URL_SEND_AUDIO);
const sendVideo = sendFile.bind(null, 'video', constants.TELEGRAM_URL_SEND_VIDEO);

const deleteMessage = async (chatId, messageId) => {
    const options = {
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
        }),
    };
    await util.makeRequest(constants.TELEGRAM_URL_DELETE_MESSAGE, options);
};

const sendStatus = async (chatId, status) => {
    const options = {
        body: JSON.stringify({
            chat_id: chatId,
            action: status,
        }),
    };
    await util.makeRequest(constants.TELEGRAM_URL_SEND_STATUS, options);
};
const sendContinuousStatus = (status, fn) => async (chatId, ...args) => {
    await sendStatus(chatId, status);
    const intervalId = setInterval(() => sendStatus(chatId, status), 5000);

    try {
        return await fn(chatId, ...args);
    } finally {
        clearInterval(intervalId);
    }
};

module.exports = {
    parseRequest,
    sendText: sendContinuousStatus(constants.TELEGRAM_STATUS_IS_TYPING, sendText),
    sendImage: sendContinuousStatus(constants.TELEGRAM_STATUS_IS_UPLOADING_IMAGE, sendImage),
    sendAudio: sendContinuousStatus(constants.TELEGRAM_STATUS_IS_UPLOADING_AUDIO, sendAudio),
    sendVideo: sendContinuousStatus(constants.TELEGRAM_STATUS_IS_UPLOADING_VIDEO, sendVideo),
    deleteMessage,
};
