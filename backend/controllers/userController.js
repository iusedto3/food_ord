import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validation from "validator";

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

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//register
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try{
        // check if user already exists
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success: false, message: "Tài khoản đã tồn tại!"});
        }

        // validate email
        if(!validation.isEmail(email)){
            return res.json({success: false, message: "Email không hợp lệ!"});
        }

        if(password.length < 8){
            return res.json({success: false, message: "Mật khẩu phải có ít nhất 8 ký tự!"});
        }
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({success: true, token});
    
    } catch(error){
        console.log(error);
        res.json({success: false, message: error.message});
    }
}


export { loginUser, registerUser };