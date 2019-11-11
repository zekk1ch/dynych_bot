const env = require('../../../env');
const constants = require('../../constants');
const TELEGRAM_URL = `https://api.telegram.org/bot${env.BOT_TOKEN}`;

module.exports = {
    ...constants,
    TELEGRAM_STATUS_IS_TYPING: 'typing',
    TELEGRAM_STATUS_IS_UPLOADING_IMAGE: 'upload_photo',
    TELEGRAM_STATUS_IS_UPLOADING_AUDIO: 'upload_audio',
    TELEGRAM_STATUS_IS_UPLOADING_VIDEO: 'upload_video',
    TELEGRAM_URL_SEND_STATUS: `${TELEGRAM_URL}/sendChatAction`,
    TELEGRAM_URL_SEND_MESSAGE: `${TELEGRAM_URL}/sendMessage`,
    TELEGRAM_URL_SEND_IMAGE: `${TELEGRAM_URL}/sendPhoto`,
    TELEGRAM_URL_SEND_AUDIO: `${TELEGRAM_URL}/sendAudio`,
    TELEGRAM_URL_SEND_VIDEO: `${TELEGRAM_URL}/sendVideo`,
    TELEGRAM_URL_DELETE_MESSAGE: `${TELEGRAM_URL}/deleteMessage`,
};
