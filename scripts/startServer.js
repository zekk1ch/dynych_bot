const env = require('../env');
const Sequelize = require('sequelize');
global.sequelize = new Sequelize(env.DATABASE_URL);

const util = require('util');
const app = require('../app');
const telegramService = require('../src/services/telegramService');
const reminderService = require('../src/services/reminderService');
app.listenAsync = util.promisify(app.listen);

(async () => {
    await app.listenAsync(env.PORT);
    console.log(`Telegram bot is listening on port ${env.PORT}`);

    await reminderService.setReminders(telegramService.sendReminder);
})();
