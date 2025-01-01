import rateLimit from "express-rate-limit";
import winston from "winston";
import redisClient from "./redisClient";

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "combined.log", level: "info" }),
  ],
});

const registerRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message:
    "Too many registrations from this IP, please try again after a minute.",
});

const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message:
    "Too many login attempts from this IP, please try again after a minute.",
});

const loginAttemptCounter = new Map<
  string,
  { attempts: number; lastAttempt: number }
>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000;

export const logFailedAttempt = async (email: string): Promise<void> => {
  const currentTime = Date.now();
  const lockKey = `login:${email}:lock`;
  const attemptKey = `login:${email}:attempts`;

  const isLocked = await redisClient.get(lockKey);

  if (isLocked) {
    throw new Error(
      "Account is locked due to multiple failed login attempts. Please try again later."
    );
  }

  const attempts = parseInt((await redisClient.get(attemptKey)) || "0", 10);

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    await redisClient.set(lockKey, "true", { EX: LOCKOUT_TIME / 1000 });
    await redisClient.del(attemptKey);
    throw new Error(
      "Account is locked due to multiple failed login attempts. Please try again in the next 5 mins."
    );
  }

  await redisClient.set(attemptKey, (attempts + 1).toString(), {
    EX: LOCKOUT_TIME / 1000,
  });
};

export const clearLoginAttempts = async (email: string): Promise<void> => {
  const attemptKey = `login:${email}:attempts`;
  const lockKey = `login:${email}:lock`;

  await redisClient.del(attemptKey);
  await redisClient.del(lockKey);
};

export {
  logger,
  registerRateLimiter,
  loginRateLimiter,
  loginAttemptCounter,
};
