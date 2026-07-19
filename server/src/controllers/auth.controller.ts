import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    req.login(newUser, (err) => {
      if (err) return next(err);
      const userToReturn = newUser.toObject();
      delete userToReturn.password;
      return res.status(201).json(userToReturn);
    });
  } catch (err) {
    next(err);
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Invalid credentials" });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      const userToReturn = user.toObject ? user.toObject() : user;
      delete userToReturn.password;
      return res.status(200).json(userToReturn);
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid"); // default cookie name
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
};

export const me = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const userToReturn = (req.user as any).toObject ? (req.user as any).toObject() : req.user;
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
  }
  return res.status(401).json({ message: "Unauthorized" });
};
