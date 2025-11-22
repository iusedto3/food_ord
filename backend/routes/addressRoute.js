import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from "../controllers/addressController.js";

const router = express.Router();

router.get("/list", authMiddleware, getAddresses);
router.post("/add", authMiddleware, addAddress);
router.put("/update/:id", authMiddleware, updateAddress);
router.delete("/delete/:id", authMiddleware, deleteAddress);

export default router;
