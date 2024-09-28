import express from "express"
import {
    getKTP,
    getKTPById,
    createKTP,
    updateKTP,
    deleteKTP,
    extractKTPPhoto,
    getTotalKTP
} from "../controllers/ktp_controller.js"
import {upload} from "../middlewares/multer.js"
import { verifyUser } from "../middlewares/auth_middleware.js";

const router = express.Router();

router.get('/ktp', verifyUser, getKTP);
router.get('/ktp/count', verifyUser, getTotalKTP);
router.get('/ktp/:id', verifyUser,  getKTPById);
router.post('/ktp', verifyUser,  createKTP);
router.patch('/ktp/:id', verifyUser, updateKTP);
router.delete('/ktp/:id', verifyUser,  deleteKTP);
router.post('/ktp/extract', upload.single('ktp'), extractKTPPhoto)

export default router;