import express from "express"
import {
    getProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product_controller.js"
import { verifyUser } from "../middlewares/auth_middleware.js";

const router = express.Router();

router.get('/product', verifyUser, getProduct);
router.get('/product/:id', verifyUser,  getProductById);
router.post('/product', verifyUser,  createProduct);
router.patch('/product/:id', verifyUser, updateProduct);
router.delete('/product/:id', verifyUser,  deleteProduct);

export default router;