"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
   class ChannelMember extends Model {
     
      static associate(models) {
         ChannelMember.belongsTo(models.Channel);
         ChannelMember.belongsTo(models.User);
      }
   }
   ChannelMember.init(
      {
         id: {
            allowNull: false,
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
         },
      },
      {
         sequelize,
         modelName: "ChannelMember",
      }
   );
   return ChannelMember;
};
