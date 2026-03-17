import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/category.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const router = Router();

router.post("/", auth, authorizeRoles("admin", "eventOwner"), createCategory);
router.put("/", auth, authorizeRoles("admin", "eventOwner"), updateCategory);
router.delete(
  "/:id",
  auth,
  authorizeRoles("admin", "eventOwner"),
  deleteCategory,
);
router.get("/", getAllCategories);

export default router;
