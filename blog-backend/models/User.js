import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const randomEmojiUrl = () => {
  const emojiUrls = [
    'https://twemoji.maxcdn.com/v/latest/72x72/1f600.png', // 😀
    'https://twemoji.maxcdn.com/v/latest/72x72/1f60e.png', // 😎
    'https://twemoji.maxcdn.com/v/latest/72x72/1f525.png', // 🔥
    'https://twemoji.maxcdn.com/v/latest/72x72/1f680.png', // 🚀
    'https://twemoji.maxcdn.com/v/latest/72x72/2b50.png', // 🌟
    'https://twemoji.maxcdn.com/v/latest/72x72/1f4a1.png', // 💡
    'https://twemoji.maxcdn.com/v/latest/72x72/1f3af.png', // 🎯
    'https://twemoji.maxcdn.com/v/latest/72x72/1f607.png', // 😇
    'https://twemoji.maxcdn.com/v/latest/72x72/1f929.png', // 🤩
    'https://twemoji.maxcdn.com/v/latest/72x72/1f4bb.png', // 💻
  ];
  return emojiUrls[Math.floor(Math.random() * emojiUrls.length)];
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
    profileEmojiUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: randomEmojiUrl,
    },
  },
  {
    timestamps: true,
  }
);

export default User;
