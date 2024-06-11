"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
   class SubChannelMember extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         SubChannelMember.belongsTo(models.SubChannel);
         SubChannelMember.belongsTo(models.User);
      }
   }
   SubChannelMember.init(
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
         modelName: "SubChannelMember",
      }
   );
   return SubChannelMember;
};
