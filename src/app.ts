import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user";
import { db } from "./config";
import { logger } from "./utils/logger";

dotenv.config();

db.sync()
  .then(() => {
    logger.info("DB connected successfully");
  })
  .catch((err: any) => {
    logger.error(`Database connection error: ${err.message}`);
  });

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
