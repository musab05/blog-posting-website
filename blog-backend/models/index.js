import { fileURLToPath } from 'url';
import { dirname, basename } from 'path';
import fs from 'fs';
import Sequelize from 'sequelize';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db = {};

const files = fs.readdirSync(__dirname).filter(file => {
  return (
    file.indexOf('.') !== 0 &&
    file !== basename(__filename) &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  );
});

for (const file of files) {
  const modelModule = await import(`./${file}`);
  db[modelModule.default.name] = modelModule.default;
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
