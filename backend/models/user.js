
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verificationCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      school: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      major: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interest: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mentorship: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('accepted', 'rejected', 'requested', 'none'),
        defaultValue: 'none',
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expirationTimestamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      tokenVersion: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      mentorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {timestamps: true},
    );



    User.associate = (models) => {
      User.hasMany(models.Post, { foreignKey: 'userId' });
      User.hasMany(models.Comment, { foreignKey: 'userId' });
      User.hasMany(models.Like, { foreignKey: 'userId' });
      User.hasMany(models.Friend, { as: 'UserFriends', foreignKey: 'userId'});
      User.hasMany(models.Friend, { as: 'FriendUserFriends', foreignKey: 'friendId'})
      User.hasMany(models.User, { as: 'Mentees', foreignKey: 'mentorId'})
      User.belongsTo(models.User, { as: 'Mentor', foreignKey: 'mentorId'})
      User.hasMany(models.Notification, { foreignKey: 'userId'})
    };

    return User;
  };
