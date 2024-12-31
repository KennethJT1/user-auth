import { Request, Response } from "express";
import { User, UserAttributes } from "../models/userModel";
import { hashPassword, comparePassword } from "../utils/passwordUtils";
import { generateToken } from "../utils/jwtUtils";
import { v4 as uuidv4 } from "uuid";
import { JwtPayload } from "jsonwebtoken";
import {
  logFailedAttempt,
  logger,
  loginAttemptCounter,
  loginRateLimiter,
  registerRateLimiter,
} from "../utils/logger";

export const registerUser = [
  registerRateLimiter,
  async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const passwordCriteria = [
        {
          regex: /[a-z]/,
          message: "Password must contain at least one lowercase letter",
        },
        {
          regex: /[A-Z]/,
          message: "Password must contain at least one uppercase letter",
        },
        { regex: /[0-9]/, message: "Password must contain at least one digit" },
        {
          regex: /[!@#$%^&*]/,
          message:
            "Password must contain at least one special character (!@#$%^&*)",
        },
      ];

      for (const { regex, message } of passwordCriteria) {
        if (!regex.test(password)) {
          return res.status(400).json({ message });
        }
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        id: uuidv4(),
        email,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User registered successfully", user });
    } catch (error: any) {
      logger.error("Registration failed: " + error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const loginUser = [
  loginRateLimiter,
  async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    try {
      logFailedAttempt(email);

      const user = (await User.findOne({
        where: { email },
      })) as unknown as UserAttributes;

      if (!user || !(await comparePassword(password, user.password))) {
        logger.warn(`Failed login attempt for email: ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      loginAttemptCounter.delete(email);

      const token = generateToken(user.id);
      res.json({ token });
    } catch (error: any) {
      logger.error("Login failed: " + error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const getUserDetails = async (
  req: JwtPayload,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.user;
    const user = (await User.findOne({
      where: { id },
    })) as unknown as UserAttributes;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = undefined!;
    res.json({ user });
  } catch (error: any) {
    logger.error("Error fetching user details: " + error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
