const actions = require('./actions');
const telegramService = require('../../services/telegram/service');
const youtubeService = require('../../services/youtube/service');

const router = async (req, res) => {
    let options;
    try {
        options = telegramService.parseRequest(req);
    } catch (err) {
        console.log(err);
        return res.status(400).end();
    }

    res.end();

    try {
        switch (options.action) {
            case 'message':
                const hasValidYoutubeUrl = options.entities.findIndex((entity) => (entity.type === 'url' || entity.type === 'text_link') && youtubeService.isValidUrl(entity.value)) !== -1;
                const hasMemeCommand = options.entities.findIndex((entity) => entity.type === 'bot_command' && entity.value === '/meme') !== -1;

                if (hasValidYoutubeUrl) {
                    await actions.sendYoutubeFormatPicker(options.chatId, options.messageId);
                } else if (hasMemeCommand) {
                    await actions.sendRandomMeme(options.chatId, options.messageId);
                } else {
                    await actions.sendDefaultResponse(options.chatId);
                }
                break;
            case 'callback':
                const { value: youtubeUrl } = options.replyEntities.find((entity) => youtubeService.isValidUrl(entity.value));

                await actions.sendYoutubeFile(options.chatId, options.messageId, options.replyMessageId, youtubeUrl, options.callbackData === 'audio');
                break;
        }
    } catch (err) {
        console.error(err);
    }
};

module.exports = router;
