import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";
import { createCategorySchema } from "../validation/category.schema.js";

export const createCategoryService = async ({
  name,
  description,
  isActive,
  userId,
}) => {
  
  const parsed = createCategorySchema.safeParse({name});

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const data = parsed.data

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
