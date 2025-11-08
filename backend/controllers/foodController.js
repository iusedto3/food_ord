import foodModel from "../models/foodModel.js";
import fs from "fs";

// add food item

    const addFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const sizes = JSON.parse(req.body.sizes || '[]');
    const options = JSON.parse(req.body.options || '[]');
    const image_filename = req.file?.filename;

    const food = new foodModel({
      name,
      description,
      price,
      category,
      sizes,
      options,
      image: image_filename,
    });

    await food.save();
    res.json({ success: true, message: "Đã thêm món thành công!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Lỗi khi thêm món!" });
  }
};


//all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({success: true, data : foods})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

// remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{})

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success: true, message: "Food item removed"})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error while removing food item"})
    }
}

const listCategories = async (req, res) => {
try {
    const foods = await foodModel.find({}, "category"); // chỉ lấy trường category
    const categories = [...new Set(foods.map(f => f.category))]; // loại trùng lặp

    res.status(200).json({
    success: true,
    data: categories
    });
} catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    res.status(500).json({
    success: false,
    message: "Lỗi khi lấy danh mục món ăn!"
    });
}
};
const getFoodByCategory = async (req, res) => {
  try {
    const { name } = req.params
    const foods = await foodModel.find({ category: name })

    if (!foods.length) {
      return res.status(404).json({
        success: false,
        message: "Không có món nào trong danh mục này"
      })
    }

    res.status(200).json({
      success: true,
      data: foods
    })
  } catch (error) {
    console.error("Lỗi khi lấy món theo danh mục:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy món theo danh mục"
    })
  }
}
export {addFood,listFood,removeFood,listCategories,getFoodByCategory};