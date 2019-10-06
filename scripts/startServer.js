const env = require('../env');
const Sequelize = require('sequelize');
global.sequelize = new Sequelize(env.DATABASE_URL);

const app = require('../app');
const telegramService = require('../src/services/telegramService');
const reminderService = require('../src/services/reminderService');

app.listen(env.PORT, () => {
    console.log(`Telegram bot is listening on port ${env.PORT}`);

    reminderService.setReminders(telegramService.sendReminder);
});
