import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoryService,
  updateCategoryService,
} from "../services/category.service.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    await createCategoryService({
      name,
      description,
      isActive,
      userId: req.user.id,
    });

    res
      .status(204)
      .json({ success: true, message: "Category added successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id, name, description, isActive } = req.body;

    await updateCategoryService({
      id,
      name,
      description,
      isActive,
      userId: req.user.id,
    });

    res
      .status(204)
      .json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const id = req.params?.id;
    await deleteCategoryService({ id });

    res
      .status(204)
      .json({ success: true, message: "Category deleted successfully" });
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
