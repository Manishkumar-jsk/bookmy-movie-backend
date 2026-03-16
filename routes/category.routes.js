import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
} from "../controllers/category.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const router = Router();

router.post("/", auth, authorizeRoles("admin", "eventOwner"), createCategory);
router.get("/", getAllCategories);

export default router;
