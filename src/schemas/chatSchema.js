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
    reminders: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: false,
    },
}, {
    tableName: 'chat',
    underscored: true,
    scopes: {
        reminder: {
            attributes: ['id', 'reminders', 'createdAt', 'updatedAt'],
        },
    },
});
