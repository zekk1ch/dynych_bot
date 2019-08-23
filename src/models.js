const fs = require('fs');
const path = require('path');
const constants = require('./constants');
const sequelize = global.sequelize;
const schemasDir = path.join(constants.rootPath, 'src', 'schemas');

const models = fs
    .readdirSync(schemasDir)
    .map((schemaName) => path.join(schemasDir, schemaName))
    .map((schemaPath) => sequelize.import(schemaPath))
    .reduce((res, model) => ({
        ...res,
        [model.name]: model,
    }), {});

Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;
