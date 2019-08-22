const fs = require('fs');
const ytdl = require('ytdl-core');
const FormData = require('form-data');
const chatService = require('./chatService');
const mediaService = require('./mediaService');
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

const flattenRequestBody = (body = {}) => {
    let action, data, text, replyMessageId;

    if (body.message) {
        action = 'message';
        data = body.message;
        text = data.text;
    }
    else if (body.callback_query) {
        action = 'callback';
        data = body.callback_query.message;
        try {
            const { t, r } = JSON.parse(body.callback_query.data);
            text = `${t} ${data.entities[0].url}`;
            replyMessageId = r;
        } catch {
            text = body.callback_query.data;
        }
    }
    else {
        throw new Error('Unknown action');
    }

    let command = null, params = null;
    if (ytdl.validateURL(text)) {
        command = '/save_from_youtube';
        params = text;
    } else {
        const matched = text.match(/(?<command>\/[a-z_0-9]+)( +)?(?<params>.+)?/i) || { groups: {} };
        command = matched.groups.command;
        params = matched.groups.params;
    }

    return {
        action,
        messageId: data.message_id,
        chatId: data.chat.id,
        replyMessageId,
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

const sendText = async (chatId, text, replyMarkup) => {
    await sendStatus(chatId, statusTypes.typing);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text || (replyMarkup ? '' : emojiService.getRandomEmoji()),
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: replyMarkup,
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

    const chat = await chatService.getChat(chatId);
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

const saveFromYoutube = async (chatId, messageId, url) => {
    const {title} = await ytdl.getBasicInfo(url);

    const text = `<a href="${url}">${title}</a>\n\nВ каком формате сохранить видос?`;
    const replyMarkup = {
        inline_keyboard: [[
            { text: 'Аудио', callback_data: JSON.stringify({ t: '/audio', r: messageId }) },
            { text: 'Видео', callback_data: JSON.stringify({ t: '/video', r: messageId }) },
        ]],
    };
    await sendText(chatId, text, replyMarkup);
};

const sendVideo = async (chatId, url, replyMessageId) => {
    await sendStatus(chatId, statusTypes.uploadVideo);

    const filePath = await mediaService.fetchVideo(url);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('video', fs.createReadStream(filePath));
    if (replyMessageId) {
        form.append('reply_to_message_id', replyMessageId);
    }

    const options = {
        method: 'POST',
        body: form,
    };
    await util.makeRequest(constants.telegramUrl + '/sendVideo', options);

    await mediaService.deleteFile(filePath);
};

const sendAudio = async (chatId, url, replyMessageId) => {
    await sendStatus(chatId, statusTypes.uploadAudio);

    const filePath = await mediaService.extractAudio(url);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('audio', fs.createReadStream(filePath));
    const { title, performer } = util.getAudioMetadata(filePath);
    form.append('title', title);
    form.append('performer', performer);
    if (replyMessageId) {
        form.append('reply_to_message_id', replyMessageId);
    }

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
    saveFromYoutube,
    sendVideo,
    sendAudio,
};
