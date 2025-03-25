import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Blog = sequelize.define(
  'Blog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDraft: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    type: {
      type: DataTypes.ENUM('blog', 'video'),
      allowNull: true,
    },
    banner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    content: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    timestamps: true,
  }
);

Blog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

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
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    blogId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Blog,
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
  },
  {
    timestamps: true,
  }
);

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Blog.hasMany(Comment, {
  as: 'comments',
  foreignKey: 'blogId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Comment.belongsTo(Blog, {
  foreignKey: 'blogId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Comment.hasMany(Comment, {
  as: 'replies',
  foreignKey: 'parentId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Comment.belongsTo(Comment, {
  as: 'parent',
  foreignKey: 'parentId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export { Blog, Comment };
