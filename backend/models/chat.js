'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      Chat.belongsTo(models.User, { foreignKey: 'user', as: 'userDetails' });
      Chat.belongsTo(models.SubChannel, { foreignKey: 'subChannel', as: 'subChannelDetails' });
      
    }
  }

  Chat.init({
    // subChannel: {
    //   type: DataTypes.UUID,
    //   references: {
    //     model: 'SubChannels', // Name of the referenced model
    //     key: 'id', // Key in the referenced model
    //   },
    //   allowNull: false,
    // },
    // user: {
    //   type: DataTypes.UUID,
    //   references: {
    //     model: 'Users', // Name of the referenced model
    //     key: 'id', // Key in the referenced model
    //   },
    //   allowNull: false,
    // },
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    message: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    attachment: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Chat',
    tableName: 'Chats',
    timestamps: false, 
  });

  return Chat;
};
