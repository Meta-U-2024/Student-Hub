module.exports = (sequelize, DataTypes) => {
    const Friend = sequelize.define('Friend', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      friendName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      friendId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    Friend.associate = (models) => {
      Friend.belongsTo(models.User, { as: 'User', foreignKey: 'userId' });
      Friend.belongsTo(models.User, { as: 'FriendUser', foreignKey: 'friendId' });
    };

    return Friend;
  };
