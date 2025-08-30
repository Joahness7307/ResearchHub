'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      // Associations here later if needed
    }
  }

  UserProfile.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: DataTypes.UUID,
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    department: DataTypes.STRING,
    year_level: DataTypes.STRING,
    block: DataTypes.STRING,
    gender: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    bio: DataTypes.TEXT,
    profile_picture_url: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserProfile',
    tableName: 'user_profiles', // MUST match Supabase table
    timestamps: false // They already have created_at, updated_at
  });

  return UserProfile;
};
