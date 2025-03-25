import fs from 'fs';
import csv from 'csv-parser';
import { Sequelize } from 'sequelize';

import sequelize from '../config/database.js'; // <- Import sequelize instance
import User from './User.js';
import { Blog } from './Blog.js';

async function importUsers() {
  return new Promise((resolve, reject) => {
    const users = [];
    fs.createReadStream('./Users.csv')
      .pipe(csv())
      .on('data', row => {
        users.push(row);
      })
      .on('end', async () => {
        try {
          for (const user of users) {
            await User.create({
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              password: user.password,
              bio: user.bio,
              profileUrl: user.profileUrl,
            });
          }
          console.log('✅ Users imported');
          resolve();
        } catch (err) {
          console.error('❌ Error importing users:', err);
          reject(err);
        }
      });
  });
}

async function importBlogs() {
  return new Promise((resolve, reject) => {
    const blogs = [];
    fs.createReadStream('./Blogs.csv')
      .pipe(csv())
      .on('data', row => {
        blogs.push(row);
      })
      .on('end', async () => {
        try {
          for (const blog of blogs) {
            await Blog.create({
              id: blog.id,
              title: blog.title,
              isDraft: blog.isDraft === 'true',
              type: blog.type,
              banner: blog.banner,
              shortDescription: blog.shortDescription,
              tags: blog.tags ? JSON.parse(blog.tags) : [],
              content: blog.content ? JSON.parse(blog.content) : {},
              video: blog.video,
              userId: blog.userId, // Make sure CSV includes userId
            });
          }
          console.log('✅ Blogs imported');
          resolve();
        } catch (err) {
          console.error('❌ Error importing blogs:', err);
          reject(err);
        }
      });
  });
}

async function main() {
  await sequelize.sync(); // Sync DB if needed (or comment this if already migrated)
  await importUsers();
  await importBlogs();
  console.log('🎉 Import completed!');
  process.exit();
}

main();
