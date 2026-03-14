import {
  createCategoryService,
  getAllCategoryService,
} from "../services/category.service.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    const category = await createCategoryService({
      name,
      description,
      isActive,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const data = await getAllCategoryService();

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
