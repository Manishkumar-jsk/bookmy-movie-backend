import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { addUser, deleteUser, updateUser, user } from "../controllers/user.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const router = Router();

router.get('/me',auth,user);
router.post('/add',auth,authorizeRoles("admin", "eventOwner"),addUser);
router.post('/update',auth,authorizeRoles("admin", "eventOwner"),updateUser);
router.post('/delete/:id',auth,authorizeRoles("admin", "eventOwner"),deleteUser)

export default router