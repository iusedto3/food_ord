import foodModel from "../models/foodModels.js";
import fs from "fs";

//add food item

const addFood = async (req, res) => {
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    });
    try{
        await food.save();
        res.json({success:true, message:"Thêm món ăn thành công", food});
    }catch(error) {
        console.log(error);
        res.json({success:false, message:"Thêm món ăn thất bại"});
}}

export {addFood}