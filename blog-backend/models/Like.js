import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Blog from './Blog.js';

const Like = sequelize.define(
  'Like',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    blogId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Blogs',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'blogId'],
      },
    ],
  }
);

Like.belongsTo(User, { foreignKey: 'userId' });
Like.belongsTo(Blog, { foreignKey: 'blogId' });

Like.afterCreate(async like => {
  await Blog.increment('likesCount', {
    where: { id: like.blogId },
  });
});

Like.afterDestroy(async like => {
  await Blog.decrement('likesCount', {
    where: { id: like.blogId },
  });
});

export default Like;
