// backend/controllers/foodController.js
import foodModel from "../models/foodModel.js";
import fs from "fs";
import path from "path";

/* ---------------------------------------------
   CREATE FOOD (ADD)
--------------------------------------------- */
export const addFood = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      sizes,
      options,
      crustEnabled,
      crustList,
    } = req.body;

    const image_filename = req.file?.filename || "";

    const food = new foodModel({
      name,
      description,
      price,
      category,
      image: image_filename,

      sizes: sizes ? JSON.parse(sizes) : [],
      options: options ? JSON.parse(options) : [],

      crust: {
        enabled: crustEnabled === "true" || crustEnabled === true,
        list: crustList ? JSON.parse(crustList) : [],
      },
    });

    await food.save();
    res.json({ success: true, message: "Thêm món thành công!", data: food });
  } catch (error) {
    console.error("Add food error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm món!",
    });
  }
};

/* ---------------------------------------------
   LIST FOOD (GET)
--------------------------------------------- */
// GET /api/food/list?page=1&limit=10&search=&category=&sort=price_asc
export const listFood = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      sort = "",
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // Search theo tên
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Lọc theo danh mục
    if (category) {
      query.category = category;
    }

    // Tính tổng
    const total = await foodModel.countDocuments(query);

    // Sort
    let sortOption = {};

    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;

    // Lấy dữ liệu trang hiện tại
    const foods = await foodModel
      .find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: foods,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List Food Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ---------------------------------------------
   REMOVE FOOD (DELETE)
--------------------------------------------- */
export const removeFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Missing food ID" });
    }

    const deleted = await foodModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    res.json({ success: true, message: "Food deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------
   UPDATE FOOD (PUT)
--------------------------------------------- */
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await foodModel.findById(id);
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food không tồn tại!" });
    }

    // Nếu upload ảnh mới thì xoá ảnh cũ
    if (req.file?.filename) {
      const oldImgPath = path.join(process.cwd(), "uploads", food.image);
      fs.unlink(oldImgPath, () => {});
      food.image = req.file.filename;
    }

    // UPDATE basic info
    food.name = req.body.name ?? food.name;
    food.description = req.body.description ?? food.description;
    food.price = req.body.price ?? food.price;
    food.category = req.body.category ?? food.category;

    // Sizes
    if (req.body.sizes) {
      food.sizes = JSON.parse(req.body.sizes);
    }

    // Options (toppings)
    if (req.body.options) {
      food.options = JSON.parse(req.body.options);
    }

    // Crust
    if (typeof req.body.crustEnabled !== "undefined") {
      food.crust.enabled =
        req.body.crustEnabled === "true" || req.body.crustEnabled === true;
    }

    if (req.body.crustList) {
      food.crust.list = JSON.parse(req.body.crustList);
    }

    // Available status
    if (typeof req.body.available !== "undefined") {
      food.available =
        req.body.available === "true" || req.body.available === true;
    }

    await food.save();

    res.json({
      success: true,
      message: "Cập nhật món thành công!",
      data: food,
    });
  } catch (error) {
    console.error("Update food error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật món!",
    });
  }
};

/* ---------------------------------------------
   LIST CATEGORIES
--------------------------------------------- */
export const listCategories = async (req, res) => {
  try {
    const foods = await foodModel.find({}, "category");
    const categories = [...new Set(foods.map((f) => f.category))];

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("List categories error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh mục!",
    });
  }
};

/* ---------------------------------------------
   GET FOOD BY CATEGORY
--------------------------------------------- */
export const getFoodByCategory = async (req, res) => {
  try {
    const { name } = req.params;

    const foods = await foodModel.find({ category: name });
    if (!foods.length) {
      return res.json({
        success: false,
        message: "Không có món nào trong danh mục này",
      });
    }

    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Get food by category error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy món theo danh mục!",
    });
  }
};


/* ---------------------------------------------
   GET SINGLE FOOD BY ID (MỚI)
--------------------------------------------- */
export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await foodModel.findById(id);
    
    if (!food) {
      return res.json({ success: false, message: "Không tìm thấy món ăn" });
    }

    res.json({ success: true, data: food });
  } catch (error) {
    console.error("Get Food ID Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};