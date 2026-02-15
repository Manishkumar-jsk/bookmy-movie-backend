import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//models
import User from "../models/User.js";
import {
  userLoginSchema,
  userSigninSchema,
} from "../validation/auth.schema.js";

//utils
import AppError from "../utils/AppError.js";

export const registerService = async ({ name, email, password }) => {
  const parsed = userSigninSchema.safeParse({ name, email, password });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message, 400);
  }

  const data = parsed?.data;

  const alreadyExist = await User.findOne({ email: data?.email });

  if (alreadyExist) {
    throw new AppError("User already exists", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data?.password, salt);

  const user = await User.create({ ...data, password: hashedPassword });

  return { user, token: generateToken(user._id) };
};

export const loginService = async ({ email, password }) => {
  const parsed = userLoginSchema.safeParse({ email, password });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const data = parsed.data;

  const user = await User.findOne({ email: data.email });

  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }

  const match = await bcrypt.compare(data?.password, user.password);

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
