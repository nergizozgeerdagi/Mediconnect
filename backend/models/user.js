'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     
         // Kullanıcı birden çok kanal yaratabilir
        User.hasMany(models.Channel, { foreignKey: 'createdBy' });

        // Kullanıcı birden çok davetiye gönderebilir ve alabilir
        User.hasMany(models.Invite, { foreignKey: 'userId', as: 'receivedInvites' });
        User.hasMany(models.Invite, { foreignKey: 'inviterId', as: 'sentInvites' });
  
        // Kullanıcı davet ile bir çok kanala katılabilir
        User.belongsToMany(models.Channel, {
          through: models.Invite,
          foreignKey: 'userId',
          as: 'memberChannels'
        });

        User.hasMany(models.Channel, { foreignKey: 'createdBy' });

        // Kullanıcı birden çok kanala üye olabilir
      
        User.hasMany(models.ChannelMember);
        // Kullanıcı birden çok alt kanala üye olabilir
        User.hasMany(models.SubChannelMember)
        User.hasMany(models.Chat, { foreignKey: 'user', as: 'userChats' });
      }

    // Şifre Kontrolü
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  User.init({
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    faculty: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    biography: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    department: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
