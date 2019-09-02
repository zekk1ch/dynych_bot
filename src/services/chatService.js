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
    if (!file.id || typeof file.id !== 'string') {
        throw new Error(`Invalid file ID – "${file.id}"`);
    }
    if (!file.url || typeof file.url !== 'string') {
        throw new Error(`Invalid file URL – "${file.url}"`);
    }
    if (!file.format || !['mp3', 'mp4'].includes(file.format)) {
        throw new Error(`Invalid file format – "${file.format}"`);
    }
    if (!file.title || typeof file.title !== 'string') {
        throw new Error(`Invalid file title – "${file.title}"`);
    }
    if (!file.performer || typeof file.performer !== 'string') {
        throw new Error(`Invalid file performer – "${file.performer}"`);
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

const getFile = async (id, fileId) => {
    const chat = await models.Chat.scope('file').findByPk(id);
    if (!chat) {
        return undefined;
    }
    return chat.get('files').find((file) => file.id === fileId);
};

const getFileByUrl = async (id, url, format = 'mp4') => {
    const chat = await models.Chat.scope('file').findByPk(id);
    if (!chat) {
        return undefined;
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
    getFile,
    getFileByUrl,
};
