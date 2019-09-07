const fs = require('fs');
const path = require('path');
const sequelize = global.sequelize;
const schemasDir = '../src/schemas';
const models = {};

fs.readdirSync(path.resolve(schemasDir))
    .map((fileName) => path.resolve(schemasDir, fileName))
    .map((filePath) => {
        const model = sequelize.import(filePath);
        models[model.name] = model;
        return model;
    })
    .forEach((model) => {
        console.log(model);

        model.associate(models);
    });

module.exports = models;
