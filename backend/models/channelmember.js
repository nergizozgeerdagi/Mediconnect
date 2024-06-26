"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
   class ChannelMember extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
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
