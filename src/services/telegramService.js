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
    let action, data, text, replyMessageId, callbackId;

    if (body.message) {
        action = 'message';
        data = body.message;
        text = data.text;
    }
    else if (body.callback_query) {
        action = 'callback';
        data = body.callback_query.message;
        callbackId = body.callback_query.id;
        if (body.callback_query.data) {
            try {
                const { t, r } = JSON.parse(body.callback_query.data);
                text = `${t} ${data.entities[0].url}`;
                replyMessageId = r;
            } catch {
                text = body.callback_query.data;
            }
        }
        else if (body.callback_query.game_short_name) {
            text = '/game';
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
        chatId: data.chat.id,
        messageId: data.message_id,
        replyMessageId,
        callbackId,
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

const sendText = (chatId, text, { replyMarkup, replyMessageId } = {}) => {
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
            reply_to_message_id: replyMessageId,
        }),
    };
    return util.makeRequest(constants.telegramUrl + '/sendMessage', options);
};

const forwardMessage = async (chatId, messageId) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            from_chat_id: chatId,
            message_id: messageId,
        }),
    };
    await util.makeRequest(constants.telegramUrl + '/forwardMessage', options);
};

const sendReminder = async (chatId, text) => {
    const reminderText = `${emojiService.emojis.CHECK_MARK}<b> ${text}</b>`;
    await sendText(chatId, reminderText);
};

const sendRandomMeme = async (chatId) => {
    const url = await chatService.getMemeUrl(chatId);
    const filePath = await mediaService.fetchImage(url);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('photo', fs.createReadStream(filePath));

    await util.makeRequest(constants.telegramUrl + '/sendPhoto', { method: 'POST', body: form });

    await chatService.incrementMemeUrl(chatId);
    await util.deleteFile(filePath);
};

const createChat = async (chatId) => {
    const chat = await chatService.getChat(chatId);
    if (chat) {
        await sendText(chatId, 'О, привет! А я тебя помню)');
        await sendText(chatId, emojiService.getRandomEmoji(emojiService.movingEmojis));
        return;
    }
    await chatService.createChat(chatId);

    await sendText(chatId, 'Приветик)');
    await sendText(chatId, emojiService.getRandomEmoji(emojiService.movingEmojis));
};

const randomizeMemeUrls = async (chatId) => {
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
    await sendText(chatId, text, { replyMarkup });
};

const sendMedia = async (mediaType, chatId, url, { replyMessageId } = {}) => {
    const fileData = await chatService.getFileByUrl(chatId, url, mediaType);
    if (fileData) {
        return forwardMessage(chatId, fileData.messageId);
    }

    const mediaData = await mediaService.fetchMedia(url, mediaType);

    let messageId, fileId = null;
    if (mediaData.filePath) {
        let form = new FormData();
        form.append('chat_id', chatId);
        if (replyMessageId) {
            form.append('reply_to_message_id', replyMessageId);
        }
        form.append(mediaType, fs.createReadStream(mediaData.filePath));
        form.append('title', mediaData.metadata.track || mediaData.metadata.title);
        form.append('duration', mediaData.metadata.duration);
        form.append('performer', mediaData.metadata.artist);
        if (mediaType === 'video') {
            let caption = `<a href="${url}">${mediaData.metadata.title}</a>`;
            if (mediaData.fileUrl) {
                caption += `\n\nКачество получше <a href="${mediaData.fileUrl}">тут</a>`;
            }
            form.append('parse_mode', 'HTML');
            form.append('caption', caption);
        }

        const response = await util.makeRequest(`${constants.telegramUrl}/send${mediaType.replace(/^./, (c) => c.toUpperCase())}`, { method: 'POST', body: form });
        messageId = response.result.message_id;
        fileId = response.result[mediaType].file_id;
    } else {
        const text = `Файл получился слишком большой ${emojiService.emojis.PERSON_SHRUGGING}\nМаксимум могу дать <a href="${mediaData.fileUrl}">ссылку</a>`;
        const response = await sendText(chatId, text, { replyMessageId });
        messageId = response.result.message_id;
    }

    await Promise.all([
        chatService.saveFile(chatId, {
            url,
            mediaType,
            messageId,
            id: fileId,
            title: mediaData.metadata.title,
            duration: mediaData.metadata.duration,
            track: mediaData.metadata.track,
            artist: mediaData.metadata.artist,
            downloadUrl: mediaData.fileUrl,
        }).catch((err) => console.error(err)),
        mediaData.filePath && util.deleteFile(mediaData.filePath).catch((err) => console.error(err)),
    ]);
};

const setReminder = async (chatId) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            game_short_name: constants.gameName,
            reply_markup: {
                inline_keyboard: [[ { text: 'Открыть', callback_game: 'ASDF' } ]],
            },
        }),
    };
    await util.makeRequest(constants.telegramUrl + '/sendGame', options);
};

const sendGame = async (chatId, callbackId) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            callback_query_id: callbackId,
            url: `${constants.gameUrl}/${chatId}`,
        }),
    };
    await util.makeRequest(constants.telegramUrl + '/answerCallbackQuery', options);
};

const wrapSendStatus = (status, func) => async (chatId, ...args) => {
    await sendStatus(chatId, status);
    const intervalId = setInterval(() => sendStatus(chatId, status), 5000);

    try {
        return await func(chatId, ...args);
    } catch (err) {
        throw err;
    } finally {
        clearInterval(intervalId);
    }
};

module.exports = {
    flattenRequestBody,
    sendText: wrapSendStatus(statusTypes.typing, sendText),
    sendRandomMeme: wrapSendStatus(statusTypes.uploadPhoto, sendRandomMeme),
    createChat: wrapSendStatus(statusTypes.typing, createChat),
    randomizeMemeUrls: wrapSendStatus(statusTypes.typing, randomizeMemeUrls),
    saveFromYoutube: wrapSendStatus(statusTypes.typing, saveFromYoutube),
    sendVideo: wrapSendStatus(statusTypes.uploadAudio, (...args) => sendMedia('video', ...args)),
    sendAudio: wrapSendStatus(statusTypes.uploadAudio, (...args) => sendMedia('audio', ...args)),
    setReminder: wrapSendStatus(statusTypes.typing, setReminder),
    sendReminder: wrapSendStatus(statusTypes.typing, sendReminder),
    sendGame,
};
