// import rateLimit from "express-rate-limit";
// import winston from "winston";

// // Create a logger instance
// const logger = winston.createLogger({
//   level: "info", // Default log level
//   transports: [
//     new winston.transports.Console({ format: winston.format.simple() }),
//     new winston.transports.File({ filename: "combined.log", level: "info" }), // Log to file
//   ],
// });

// // Rate limiting for registration and login endpoints
// const registerRateLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute window
//   max: 1000, // Limit each IP to 1000 requests per windowMs
//   message:
//     "Too many registrations from this IP, please try again after a minute.",
// });

// const loginRateLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute window
//   max: 1000, // Limit each IP to 1000 requests per windowMs
//   message:
//     "Too many login attempts from this IP, please try again after a minute.",
// });

// // Utility to log failed login attempts and lockout if exceeded
// const loginAttemptCounter = new Map<
//   string,
//   { attempts: number; lastAttempt: number }
// >();

// const MAX_LOGIN_ATTEMPTS = 5;
// const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes lockout time

// const logFailedAttempt = (email: string) => {
//   const currentTime = Date.now();
//   const attempts = loginAttemptCounter.get(email) || {
//     attempts: 0,
//     lastAttempt: currentTime,
//   };

//   if (currentTime - attempts.lastAttempt < LOCKOUT_TIME) {
//     if (attempts.attempts >= MAX_LOGIN_ATTEMPTS) {
//       throw new Error(
//         "Account is locked due to multiple failed login attempts. Please try again later."
//       );
//     }
//   } else {
//     loginAttemptCounter.set(email, { attempts: 0, lastAttempt: currentTime });
//   }

//   loginAttemptCounter.set(email, {
//     attempts: attempts.attempts + 1,
//     lastAttempt: currentTime,
//   });
// };

// // Export everything as default
// export default {
//   logger,
//   registerRateLimiter,
//   loginRateLimiter,
//   logFailedAttempt,
//   loginAttemptCounter,
// };
import rateLimit from "express-rate-limit";
import winston from "winston";

// Create a logger instance
const logger = winston.createLogger({
  level: "info", // Default log level
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "combined.log", level: "info" }), // Log to file
  ],
});

// Rate limiting for registration and login endpoints
const registerRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message:
    "Too many registrations from this IP, please try again after a minute.",
});

const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message:
    "Too many login attempts from this IP, please try again after a minute.",
});

// Utility to log failed login attempts and lockout if exceeded
const loginAttemptCounter = new Map<
  string,
  { attempts: number; lastAttempt: number }
>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes lockout time

const logFailedAttempt = (email: string) => {
  const currentTime = Date.now();
  const attempts = loginAttemptCounter.get(email) || {
    attempts: 0,
    lastAttempt: currentTime,
  };

  if (currentTime - attempts.lastAttempt < LOCKOUT_TIME) {
    if (attempts.attempts >= MAX_LOGIN_ATTEMPTS) {
      throw new Error(
        "Account is locked due to multiple failed login attempts. Please try again later."
      );
    }
  } else {
    loginAttemptCounter.set(email, { attempts: 0, lastAttempt: currentTime });
  }

  loginAttemptCounter.set(email, {
    attempts: attempts.attempts + 1,
    lastAttempt: currentTime,
  });
};

// Directly export the logger instance
export { logger, registerRateLimiter, loginRateLimiter, logFailedAttempt, loginAttemptCounter };
