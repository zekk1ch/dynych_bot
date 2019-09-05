const util = require('./utilService');
const masterService = require('./masterService');
const models = require('../models');

const getChat = (id) => models.Chat.findByPk(id);

const createChat = async (id) => {
    const masterMemeUrls = await masterService.getMasterMemeUrls();
    const memeUrls = util.randomizeArray(masterMemeUrls);

    await models.Chat.create({
        id,
        memeUrls,
    });
};

const randomizeMemeUrls = async (id) => {
    const masterMemeUrls = await masterService.getMasterMemeUrls();
    const memeUrls = util.randomizeArray(masterMemeUrls);

    await models.Chat.update({ memeUrls, lastMemeUrlIndex: 0 }, { where: { id } });
};

const getMemeUrl = async (id) => {
    const chat = await models.Chat.findByPk(id);
    if (!chat) {
        throw new Error(`Твой чат ещё не зарегестрирован.\nНапиши мне  /start`);
    }

    const memeUrls = chat.get('memeUrls');
    const index = chat.get('lastMemeUrlIndex');

    return memeUrls[index];
};

const incrementMemeUrl = async (id) => {
    const chat = await models.Chat.findByPk(id);
    const memeUrls = chat.get('memeUrls');
    const index = chat.get('lastMemeUrlIndex');

    if (index >= memeUrls.length - 1) {
        await randomizeMemeUrls(id);
    } else {
        await chat.increment('lastMemeUrlIndex');
    }
};

const validateFile = (file = {}) => {
    if (!file.url || typeof file.url !== 'string') {
        throw new Error(`Invalid file URL – "${file.url}"`);
    }
    if (!file.format || !['mp3', 'mp4'].includes(file.format)) {
        throw new Error(`Invalid file format – "${file.format}"`);
    }
    if (!Array.isArray(file.parts)) {
        throw new Error(`Invalid file parts – "${file.parts}"`);
    }
    file.parts.forEach((part, i, arr) => {
        if (!part.id || typeof part.id !== 'string') {
            throw new Error(`Invalid ID of a file part at index ${i} in "${arr}"`);
        }
        if (!part.title || typeof part.title !== 'string') {
            throw new Error(`Invalid title of a file part at index ${i} in "${arr}"`);
        }
    });

    if (file.track && typeof file.track !== 'string') {
        throw new Error(`Invalid file track name – "${file.track}"`);
    }
    if (file.artist && typeof file.artist !== 'string') {
        throw new Error(`Invalid file artist – "${file.artist}"`);
    }
    if (file.album && typeof file.album !== 'string') {
        throw new Error(`Invalid file album – "${file.album}"`);
    }
};

const saveFile = async (id, file) => {
    const chat = await models.Chat.scope('file').findByPk(id);
    if (!chat) {
        throw new Error(`Chat with ID "${id}" doesn't exist`);
    }

    validateFile(file);
    const files = chat.get('files');
    files.push(file);
    await chat.update({ files }, { where: {id} });
};

const getFileByUrl = async (id, url, format = 'mp4') => {
    const chat = await models.Chat.scope('file').findByPk(id);
    if (!chat) {
        return null;
    }
    return chat.get('files').find((file) => file.url === url && file.format === format);
};

module.exports = {
    getChat,
    createChat,
    randomizeMemeUrls,
    getMemeUrl,
    incrementMemeUrl,
    saveFile,
    getFileByUrl,
};
