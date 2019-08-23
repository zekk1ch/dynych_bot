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
        throw new Error(`Chat with id ${id} doesn't exist`);
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

module.exports = {
    getChat,
    createChat,
    randomizeMemeUrls,
    getMemeUrl,
    incrementMemeUrl,
};
