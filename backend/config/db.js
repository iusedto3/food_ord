import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://hellohi580:20062000@cluster0.qcp3gjo.mongodb.net/project-x').then(()=>console.log("MongoDB connected successfully"))
}