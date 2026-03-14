import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
} from "../controllers/category.controller.js";

const router = Router();

router.post("/", auth, createCategory);
router.get("/", getAllCategories);

export default router;
