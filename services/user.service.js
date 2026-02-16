import AppError from "../utils/AppError.js";
import User from "../models/User.js";

export const getUserService = async ({ userId }) => {
  const user = await User.findById({ _id: userId }).select("_id name email role");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
