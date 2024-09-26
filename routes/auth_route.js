import express from "express"
import {
    LogIn, Me, LogOut
} from "../controllers/auth_controller.js"

const router = express.Router();

router.get('/me', Me);
router.post('/login',LogIn);
router.delete('/logout', LogOut);

export default router;