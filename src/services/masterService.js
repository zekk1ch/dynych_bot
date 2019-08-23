const models = require('../index');
const constants = require('../constants');

const getMasterMemeUrls = async () => {
    const masterMemeUrls = await models.Master.findByPk(constants.masterTypes.MEME_URLS);
    if (!masterMemeUrls) {
        throw new Error(`Failed to find source ${constants.masterTypes.MEME_URLS}`);
    }

    return masterMemeUrls.get('data');
};

module.exports = {
    getMasterMemeUrls,
};
