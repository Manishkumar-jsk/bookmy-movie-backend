import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";
import { createCategorySchema } from "../validation/category.schema.js";
import { idSchema } from "../validation/event.schema.js";

export const createCategoryService = async ({
  name,
  description,
  isActive,
  userId,
}) => {
  const parsed = createCategorySchema.safeParse({ name });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const data = parsed.data;

  const existingCategory = await Category.findOne({
    name: { $regex: `^${data?.name}`, $options: "i" },
  });

  if (existingCategory) {
    throw new AppError("category already exits", 409);
  }

  const category = await Category.create({
    ...data,
    description,
    isActive,
    createdBy: userId,
  });

  return category;
};

export const updateCategoryService = async ({
  id,
  name,
  description,
  isActive,
  userId,
}) => {
  if (!id) {
    throw new AppError("Id is mandatory", 400);
  }

  const parsed = createCategorySchema.safeParse({ name });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const data = parsed.data;

  const category = await Category.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        ...data,
        description,
        isActive,
      },
    },
    { new: true },
  );

  return category;
};

export const deleteCategoryService = async ({ id }) => {
  const parsed = idSchema.safeParse({ id });
  const data = parsed?.data;

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const event = await Category.findByIdAndDelete(data.id);

  return event;
};

export const getAllCategoryService = async () => {
  const categories = await Category.find({});

  return categories;
};
