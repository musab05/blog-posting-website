import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Blog from './Blog.js';

const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 5000],
      },
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Comments',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    depth: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        max: 5,
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ['blogId'] },
      { fields: ['parentId'] },
      { fields: ['createdAt'] },
    ],
  }
);

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

Comment.belongsTo(Comment, {
  foreignKey: 'parentId',
  as: 'parentComment',
});

Comment.hasMany(Comment, {
  foreignKey: 'parentId',
  as: 'replies',
});

Comment.afterCreate(async comment => {
  if (comment.parentId) {
    const parent = await Comment.findByPk(comment.parentId);
    if (parent) {
      comment.depth = parent.depth + 1;
      await comment.save();
    }
  }
});

export default Comment;
