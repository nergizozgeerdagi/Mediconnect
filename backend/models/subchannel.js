'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SubChannel extends Model {
    static associate(models) {
      SubChannel.belongsTo(models.Channel, { foreignKey: 'channelId' });
     
      SubChannel.hasMany(models.SubChannelMember);
      
      SubChannel.hasMany(models.Chat, { foreignKey: 'subChannelId' });
      SubChannel.hasMany(models.Chat, { foreignKey: 'subChannel', as: 'chats' });

    }
  }

  SubChannel.init({
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // channelId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Channels',
    //     key: 'id'
    //   }
    // }
  }, {
    sequelize,
    modelName: 'SubChannel',
  });

  return SubChannel;
};
