import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validation from "validator";
import crypto from "crypto";
import nodemailer from "nodemailer";
import VerificationToken from "../models/verificationTokenModel.js";
import ResetToken from "../models/resetTokenModel.js";


const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "Người dùng không tồn tại!"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success: false, message: "Sai mật khẩu!"});
        }

        const token = createToken(user._id);
        res.json({success: true, token});

    } catch(error){

        console.log(error);
        res.json({success: false, message: "error.message"});
    }
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email đã tồn tại!" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name,
      email,
      phone,
      password: hashed,
      isVerified: false
    });

    // xoá token cũ nếu có
    await VerificationToken.deleteMany({ userId: newUser._id });

    // tạo token
    const token = crypto.randomBytes(32).toString("hex");

    await VerificationToken.create({
      userId: newUser._id,
      token,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 phút
    });

    const verifyLink = `http://localhost:5173/verify-email/${token}`;

    // gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác thực tài khoản của bạn",
      html: `
        <h2>Xác thực tài khoản</h2>
        <p>Nhấp vào link bên dưới để xác thực tài khoản:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>Link có hiệu lực trong 10 phút.</p>
      `
    });

    res.json({ success: true, message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực." });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};
const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Thiếu email" });
        }

        const exists = await userModel.findOne({ email });

        if (exists) {
            return res.json({ success: true, exists: true });
        }

        return res.json({ success: true, exists: false });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    const record = await VerificationToken.findOne({ token });
    if (!record) {
      return res.json({ success: false, message: "Token không hợp lệ!" });
    }

    if (record.expiresAt < Date.now()) {
      return res.json({ success: false, message: "Token đã hết hạn!" });
    }

    await userModel.findByIdAndUpdate(record.userId, { isVerified: true });
    await VerificationToken.findByIdAndDelete(record._id);

    res.json({ success: true, message: "Xác thực tài khoản thành công!" });

  } catch (error) {
    res.json({ success: false, message: "Lỗi server!" });
  }
};

const sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Email không tồn tại!" });
    }

    await ResetToken.deleteMany({ userId: user._id });

    const token = crypto.randomBytes(32).toString("hex");

    await ResetToken.create({
      userId: user._id,
      token,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    const link = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhấn vào link bên dưới để tạo mật khẩu mới:</p>

        <a
          href="${link}"
          style="
            display: inline-block;
            padding: 10px 16px;
            background: #e4002b;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Đặt lại mật khẩu
        </a>

        <p>Liên kết này hết hạn sau <strong>10 phút</strong>.</p>
      `
    });

    return res.json({ success: true, message: "Email đặt lại mật khẩu đã được gửi!" });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const resetRecord = await ResetToken.findOne({ token });

    if (!resetRecord) {
      return res.json({ success: false, message: "Token không hợp lệ!" });
    }

    if (resetRecord.expiresAt < Date.now()) {
      await ResetToken.deleteMany({ token });
      return res.json({ success: false, message: "Token đã hết hạn!" });
    }

    const user = await userModel.findById(resetRecord.userId);
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại!" });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    await user.save();

    await ResetToken.deleteMany({ userId: user._id });

    return res.json({ success: true, message: "Đổi mật khẩu thành công!" });

  } catch (err) {
    res.json({ success: false, message: "Lỗi server!" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại!" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
}

// updateProfile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await userModel.findById(req.body.userId);

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại!" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();
    res.json({ success: true, message: "Thông tin cá nhân đã được cập nhật!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// changePassword
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.body.userId);

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Mật khẩu cũ không đúng!" });
    }const listUsers = async (req, res) => {
  try {
    // Lấy tất cả user, loại bỏ trường password để bảo mật
    // Sắp xếp người mới đăng ký lên đầu
    const users = await userModel.find({}).select("-password").sort({ createdAt: -1 });
    
    // (Optional) Bạn có thể tính thêm tổng đơn hàng của user ở đây nếu muốn
    // nhưng để đơn giản thì trả về list user trước.
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server khi lấy danh sách user!" });
  }
};

// ADMIN: Cập nhật trạng thái (Khóa / Mở khóa)
const updateUserStatus = async (req, res) => {
  try {
    const { userId, isBlocked } = req.body;

    const user = await userModel.findByIdAndUpdate(
        userId, 
        { isBlocked: isBlocked }, 
        { new: true } // Trả về dữ liệu mới sau khi update
    );

    if (!user) {
        return res.json({ success: false, message: "Không tìm thấy User" });
    }

    res.json({ 
        success: true, 
        message: isBlocked ? "Đã khóa tài khoản thành công!" : "Đã mở khóa tài khoản!" 
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true, message: "Mật khẩu đã được đổi thành công!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// ADMIN: Lấy danh sách user
const listUsers = async (req, res) => {
  try {
    // Lấy tất cả user, loại bỏ trường password để bảo mật
    // Sắp xếp người mới đăng ký lên đầu
    const users = await userModel.find({}).select("-password").sort({ createdAt: -1 });
    
    // (Optional) Bạn có thể tính thêm tổng đơn hàng của user ở đây nếu muốn
    // nhưng để đơn giản thì trả về list user trước.
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server khi lấy danh sách user!" });
  }
};

// ADMIN: Cập nhật trạng thái (Khóa / Mở khóa)
const updateUserStatus = async (req, res) => {
  try {
    const { userId, isBlocked } = req.body;

    const user = await userModel.findByIdAndUpdate(
        userId, 
        { isBlocked: isBlocked }, 
        { new: true } // Trả về dữ liệu mới sau khi update
    );

    if (!user) {
        return res.json({ success: false, message: "Không tìm thấy User" });
    }

    res.json({ 
        success: true, 
        message: isBlocked ? "Đã khóa tài khoản thành công!" : "Đã mở khóa tài khoản!" 
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// 1. ADMIN: Thêm người dùng mới
const addUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Kiểm tra tồn tại
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email đã tồn tại!" });
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "user", // Mặc định là user nếu không chọn
      isVerified: true, // Admin tạo thì mặc định xác thực luôn
    });

    await newUser.save();
    res.json({ success: true, message: "Thêm người dùng thành công!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// 2. ADMIN: Sửa thông tin người dùng
const editUser = async (req, res) => {
  try {
    const { userId, name, phone, role } = req.body;

    await userModel.findByIdAndUpdate(userId, {
        name,
        phone,
        role
    });

    res.json({ success: true, message: "Cập nhật thành công!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// 3. ADMIN: Xóa người dùng
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa người dùng!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};


export { loginUser, registerUser, checkEmail, sendResetLink, resetPassword, getUser, updateProfile, changePassword, listUsers, updateUserStatus, addUser, editUser, deleteUser };