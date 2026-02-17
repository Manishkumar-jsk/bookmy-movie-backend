import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { createCategory } from "../controllers/category.controller.js";

const router = Router();

router.post("/",auth,createCategory)

export default router;