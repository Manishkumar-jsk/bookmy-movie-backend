import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { addUser, deleteUser, getUser, updateUser, user } from "../controllers/user.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const router = Router();

router.get('/me',auth,user);
router.post('/add',auth,authorizeRoles("admin"),addUser);
router.put('/update',auth,authorizeRoles("admin"),updateUser);
router.delete('/delete/:id',auth,authorizeRoles("admin"),deleteUser);
router.get('/',auth,authorizeRoles("admin"),getUser)

export default router