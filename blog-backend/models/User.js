import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const randomAvatarUrl = () => {
  const styles = ['adventurer', 'micah', 'avataaars', 'pixel-art'];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const seed = Math.floor(Math.random() * 10000);
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
};

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: randomAvatarUrl,
    },
  },
  {
    timestamps: true,
  }
);

export default User;
