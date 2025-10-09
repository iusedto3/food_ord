import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://hellohi580:200600@cluster0.rsxk5mw.mongodb.net/food-ord').then(()=>console.log("DB connected"));
}