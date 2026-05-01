import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';

import dotenv from 'dotenv';
dotenv.config();

const DB_NAME = process.env.DB_NAME || 'student_project_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || 'root';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';

// Create DB if it doesn't exist (Only for local MySQL)
export const initializeDatabase = async () => {
  if (process.env.DATABASE_URL) return; // Skip for production Postgres
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
    console.log(`Database '${DB_NAME}' created or already exists.`);
  } catch (error) {
    console.error('Error creating database:', error);
    // Don't throw if we can't create DB, Sequelize might still work if it exists
  }
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASS, {
      host: DB_HOST,
      dialect: 'mysql',
      logging: false,
    });

export default sequelize;
