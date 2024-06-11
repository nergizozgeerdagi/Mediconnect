'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Invite.belongsTo(models.Channel, { foreignKey: 'channelId' });
      Invite.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Invite.belongsTo(models.User, { foreignKey: 'inviterId', as: 'inviter' });
    }
  }
  Invite.init({
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // channelId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Channels',
    //     key: 'id'
    //   }
    // },
    // userId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Users',
    //     key: 'id'
    //   }
    // },
    // inviterId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Users',
    //     key: 'id'
    //   }
    // },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Invite',
  });
  return Invite;
};