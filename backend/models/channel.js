'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    static associate(models) {
      // Kanalların bir çok alt kanalı vardır
      Channel.hasMany(models.SubChannel, { foreignKey: 'channelId' });
      
      // Kanalların birden çok kullanıcısı vardır
      Channel.hasMany(models.ChannelMember);
      
      // Kanal Sahibi
      Channel.belongsTo(models.User, { foreignKey: 'createdBy' });
    }
  }

  Channel.init({
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
    description: {
      type: DataTypes.STRING,
      defaultValue: 'Kanal Konusu'
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    // createdBy: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false
    // }
  }, {
    sequelize,
    modelName: 'Channel',
    timestamps: true
  });

  return Channel;
};
