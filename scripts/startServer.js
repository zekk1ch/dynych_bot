const env = require('../env');

const Sequelize = require('sequelize');
global.sequelize = new Sequelize(env.DATABASE_URL);

const app = require('../app');
app.listen(env.PORT, () => {
    console.log(`Telegram bot is listening on port ${env.PORT}`);
});
