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

const sendText = async (chatId, text, replyMarkup) => {
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
    await sendText(chatId, text, replyMarkup);
};

const answerCallback = (callbackId) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            callback_query_id: callbackId,
            show_alert: false,
        }),
    };
    return util.makeRequest(constants.telegramUrl + '/answerCallbackQuery', options);
};

const media = {
    mp3: {
        type: 'audio',
        hookMethod: 'sendAudio',
    },
    mp4: {
        type: 'video',
        hookMethod: 'sendVideo',
    },
};
const sendMedia = async (format, chatId, url, { callbackId, replyMessageId } = {}) => {
    if (!Object.keys(media).includes(format)) {
        throw new Error(`Unsupported media format – "${format}"`);
    }
    if (callbackId) {
        await answerCallback(callbackId).catch((err) => {
            console.error('Failed to answer callback query');
            console.error(err);
        });
    }

    const file = await chatService.getFileByUrl(chatId, url, format);
    if (file) {
        const partIds = file.parts.map((part) => part.id);
        for (let partId of partIds) {
            const form = new FormData();
            form.append('chat_id', chatId);
            form.append(media[format].type, partId);
            if (partIds.length === 1 && replyMessageId) {
                form.append('reply_to_message_id', replyMessageId);
            }

            await util.makeRequest(`${constants.telegramUrl}/${media[format].hookMethod}`, { method: 'POST', body: form });
        }
        return;
    }

    const filePath = await mediaService.fetchVideo(url, format);
    const parts = await mediaService.splitFile(filePath);

    const fileIds = [];
    for (let part of parts) {
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append(media[format].type, fs.createReadStream(part.path));
        form.append('title', part.metadata.track || part.metadata.title);
        form.append('performer', part.metadata.artist);
        if (parts.length === 1 && replyMessageId) {
            form.append('reply_to_message_id', replyMessageId);
        }

        const response = await util.makeRequest(`${constants.telegramUrl}/${media[format].hookMethod}`, { method: 'POST', body: form });
        fileIds.push(response.result[media[format].type].file_id);
    }

    const promises = [];
    promises.push(chatService.saveFile(chatId, {
        url,
        format,
        track: parts[0].metadata.track,
        artist: parts[0].metadata.artist,
        album: parts[0].metadata.album,
        parts: parts.map((part, i) => ({
            id: fileIds[i],
            title: part.metadata.title,
        })),
    }));
    promises.push(util.deleteFile(filePath));
    if (parts.length > 1) {
        parts.forEach((part) => {
            promises.push(util.deleteFile(part.path));
        });
    }
    await Promise.all(promises);
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
    sendVideo: wrapSendStatus(statusTypes.uploadAudio, (...args) => sendMedia('mp4', ...args)),
    sendAudio: wrapSendStatus(statusTypes.uploadAudio, (...args) => sendMedia('mp3', ...args)),
    setReminder: wrapSendStatus(statusTypes.typing, setReminder),
    sendReminder: wrapSendStatus(statusTypes.typing, sendReminder),
    sendGame,
};
