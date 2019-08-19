module.exports = (sequelize, DataTypes) => sequelize.define('Chat', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    memeUrls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
    },
    lastMemeUrlIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'chat',
    underscored: true,
});
