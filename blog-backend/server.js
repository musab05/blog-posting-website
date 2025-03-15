import express from 'express';
import "dotenv/config";
import cors from 'cors';
import bodyParser from 'body-parser';
import sequelize from './config/database.js';
import authRoutes from './routes/authRoutes.js';


const app = express();
console.log("KKKKKK", process.env.JWT_SECRET)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
