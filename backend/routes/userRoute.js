import express from 'express';
import { loginUser, registerUser, checkEmail,sendResetLink,resetPassword, verifyEmail, getUser, updateProfile, changePassword,listUsers, addUser, editUser, deleteUser, updateUserStatus, getAddressList, addAddress} from '../controllers/userController.js';
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

// (Tạm thời chưa gắn adminAuth để bạn test cho dễ, sau này nên gắn vào để bảo mật)
userRouter.get('/list', listUsers); 
userRouter.post('/status', updateUserStatus);

userRouter.post('/add', addUser);
userRouter.put('/edit', editUser);
userRouter.delete('/delete/:id', deleteUser);

userRouter.post("/addresses", authMiddleware, getAddressList);
userRouter.post("/add-address", authMiddleware, addAddress);

export default userRouter;