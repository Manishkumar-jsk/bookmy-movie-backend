import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import { addUserSchema } from "../validation/user.schema.js";
import { idSchema } from "../validation/event.schema.js";

export const getUserService = async ({ userId }) => {
  const user = await User.findById({ _id: userId }).select(
    "_id name email role",
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const getUsersService = async () => {
  const users = await User.find({}).select(
    "_id name email role",
  );

  if (!users) {
    throw new AppError("User not found", 404);
  }

  return users;
};

export const addUserService = async ({ name, email, role }) => {
  const parsed = addUserSchema.safeParse({ name, email });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message, 400);
  }

  const data = parsed?.data;

  const alreadyExist = await User.findOne({ email: data?.email });

  if (alreadyExist) {
    throw new AppError("User already exists", 400);
  }

  const temporaryPassword = generateTempPassword();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

  const user = await User.create({
    ...data,
    role: role,
    password: hashedPassword,
  });

  return user;
};

export const updateUserService = async ({ id, name, email, role }) => {
  if (!id) {
    throw new AppError("Id is missing", 400);
  }

  const parsed = addUserSchema.safeParse({ name, email });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message, 400);
  }

  const data = parsed?.data;

  const alreadyExist = await User.findOne({ email: data?.email });

  if (!alreadyExist) {
    throw new AppError("User not found", 404);
  }

  const user = await User.findOneAndUpdate({_id:id},{
    $set:{
    ...data,
    role: role
    }
  },{new:true});

  return user;
};

export const deleteUserService = async ({ id }) => {
  const parsed = idSchema.safeParse({ id });
  const data = parsed?.data;

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const user = await User.findByIdAndDelete(data.id);

  return user;
};

function generateTempPassword() {
  return Math.random().toString(36).slice(-8) + "A1!";
}
