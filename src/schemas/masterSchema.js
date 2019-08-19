module.exports = (sequelize, DataTypes) => sequelize.define('Master', {
    id: {
        primaryKey: true,
        type: DataTypes.TEXT,
        validate: {
            is: /^[a-z0-9_]+$/i,
            isUppercase: true,
        },
    },
    description: {
        type: DataTypes.TEXT,
    },
    data: {
        type: DataTypes.JSONB,
        validate: {
            customTypeValidation(value) {
                const id = this.get('id');

                switch (id) {
                    case 'MEME_URLS':
                        if (!Array.isArray(value)) {
                            throw new Error(`${id} must be an array`);
                        }
                        value.forEach((url) => {
                            if (typeof url !== 'string') {
                                throw new Error(`The following content of ${id} is not a string – ${url}`);
                            }
                        });
                        break;
                }
            },
        },
    },
}, {
    tableName: 'master',
    underscored: true,
});
