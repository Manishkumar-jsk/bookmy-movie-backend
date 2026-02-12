import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//models
import User from "../models/User.js";

//utils
import AppError from "../utils/AppError.js";

export const registerService = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  const alreadyExist = await User.findOne({ email });

  if (alreadyExist) {
    throw new AppError("User already exists", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword });

  return { user, token: generateToken(user._id) };
};

export const loginService = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("All fields are required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new AppError("Invalid email or password", 400);
  }

  return { user, token: generateToken(user._id) };
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
