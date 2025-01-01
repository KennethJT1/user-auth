import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const db = new Sequelize(process.env.DBCONNECTION_STRING!, {
  logging: false,
  dialect: "postgres",
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {
        ssl: false,
      },
});

export const port = process.env.PORT || 4000;
export const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS!);
export const JWT_SECRET = process.env.JWT_SECRET!;
export const EXPIRESIN = process.env.EXPIRESIN!;
export const REDIS_HOST = process.env.REDIS_HOST!;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT!, 10);
