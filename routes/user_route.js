import express from "express"
import { verifyUser, adminOnly } from "../middlewares/auth_middleware.js";
import {
    getUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAdminTotal,
    getUserTotal
} from "../controllers/user_controller.js"

const router = express.Router();

router.get('/users', verifyUser, adminOnly,  getUser);
router.get('/users/total-admin', verifyUser, getAdminTotal);
router.get('/users/total-user', verifyUser, getUserTotal);
router.get('/users/:id', verifyUser, adminOnly, getUserById);
router.post('/users', verifyUser, adminOnly,  createUser);
router.patch('/users/:id', verifyUser, adminOnly, updateUser);
router.delete('/users/:id', verifyUser, adminOnly, deleteUser)

export default router;