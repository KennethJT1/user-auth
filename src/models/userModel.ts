import { DataTypes, Model } from "sequelize";
import { db } from "../config";

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
}

export class User extends Model<UserAttributes> {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: db, tableName: "user" }
);
