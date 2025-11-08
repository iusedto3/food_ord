import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password:{type: String, required: true},
    cartData:{type:Object, default:{}},
    address:{
        street: {type: String, default:""},
        ward: {type: String, default:""},
        district: {type: String, default:""},
        city: {type: String, default:""},

    }
},{minimize: false,
    timestamps: true
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;