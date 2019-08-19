const env = require('../env');
const Sequelize = require('sequelize');
global.sequelize = new Sequelize(env.DATABASE_URL);
const models = require('../src/models');

(async () => {
    // await sequelize.sync({ force: true });
    await models.Chat.sync({ force: true });

    console.log('Done!');
})();
