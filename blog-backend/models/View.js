import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Blog from './Blog.js';

const View = sequelize.define(
  'View',
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
    indexes: [{ fields: ['blogId'] }, { fields: ['createdAt'] }],
  }
);

View.belongsTo(User, { foreignKey: 'userId' });
View.belongsTo(Blog, { foreignKey: 'blogId' });

export default View;
