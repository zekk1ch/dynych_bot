const Sequelize = require('sequelize');
const env = require('../env');
global.sequelize = new Sequelize(env.DATABASE_URL);
const memeService = require('../src/services/memeService');
const models = require('../src');
const constants = require('../src/constants');

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    let memeUrls, master;

    master = await models.Master.findOne({ where: { id: constants.masterTypes.MEME_URLS } });
    if (!master) {
        master =  await models.Master.create({ id: constants.masterTypes.MEME_URLS, data: [] });
    }
    memeUrls = master.get('data');

    while(true) {
        console.log(`Unique urls – ${memeUrls.length}`);
        const newMemeUrls = await memeService.getRandomMemeUrls();
        const uniqueNewMemeUrls = newMemeUrls.filter((newMemeUrl) => !memeUrls.includes(newMemeUrl));
        memeUrls.push(...uniqueNewMemeUrls);
        await master.update({ data: memeUrls });
        await sleep(500);
    }
})();
