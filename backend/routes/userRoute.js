import express from 'express';
import { loginUser, registerUser, checkEmail,sendResetLink,resetPassword, verifyEmail, getUser, updateProfile, changePassword} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser);
userRouter.get('/me', authMiddleware, getUser);
userRouter.put('/update-profile', authMiddleware, updateProfile);
userRouter.put('/change-password', authMiddleware, changePassword);

userRouter.post("/check-email", checkEmail);

userRouter.post("/reset-password-link", sendResetLink);
userRouter.post("/reset-password/:token", resetPassword);

userRouter.get("/verify-email/:token", verifyEmail);
export default userRouter;