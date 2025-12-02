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

    // 🟢 PARSE DỮ LIỆU JSON
    // Vì FormData gửi lên là string, cần parse ra Object/Array
    let parsedSizes = { S: 0, M: 0, L: 0 };
    if (sizes) {
        try { parsedSizes = JSON.parse(sizes); } catch (e) { console.log(e); }
    }

    let parsedOptions = [];
    if (options) {
        try { parsedOptions = JSON.parse(options); } catch (e) { console.log(e); }
    }

    let parsedCrustList = [];
    if (crustList) {
        try { parsedCrustList = JSON.parse(crustList); } catch (e) { console.log(e); }
    }

    const food = new foodModel({
      name,
      description,
      price: Number(price),
      category,
      image: image_filename,

      // Lưu object size { S, M, L }
      sizes: parsedSizes,
      
      // Lưu mảng topping
      options: parsedOptions,

      // Lưu cấu hình đế bánh
      crust: {
        enabled: crustEnabled === "true" || crustEnabled === true,
        list: parsedCrustList,
      },
      
      available: true
    });

    await food.save();
    res.json({ success: true, message: "Thêm món thành công!", data: food });
  } catch (error) {
    console.error("Add food error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi thêm món!" });
  }
};

/* ---------------------------------------------
   LIST FOOD (GET - Pagination & Filter)
--------------------------------------------- */
export const listFood = async (req, res) => {
  try {
    let { page = 1, limit = 100, search = "", category = "", sort = "" } = req.query; // Tăng limit mặc định lên để dễ test

    page = Number(page);
    limit = Number(limit);

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") { // Thêm check "All"
      query.category = category;
    }

    const total = await foodModel.countDocuments(query);

    let sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else sortOption.createdAt = -1; // Mặc định mới nhất lên đầu

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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------
   REMOVE FOOD (DELETE)
--------------------------------------------- */
export const removeFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await foodModel.findById(id);
    
    if (food && food.image) {
       // Xóa ảnh cũ
       const oldImgPath = path.join(process.cwd(), "uploads", food.image);
       fs.unlink(oldImgPath, () => {});
    }

    await foodModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa món ăn" });
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
      return res.status(404).json({ success: false, message: "Món không tồn tại!" });
    }

    // Xử lý ảnh mới
    if (req.file?.filename) {
      const oldImgPath = path.join(process.cwd(), "uploads", food.image);
      fs.unlink(oldImgPath, (err) => {}); // Xóa ảnh cũ
      food.image = req.file.filename;
    }

    // Cập nhật thông tin cơ bản
    food.name = req.body.name || food.name;
    food.description = req.body.description || food.description;
    food.price = Number(req.body.price) || food.price;
    food.category = req.body.category || food.category;

    // Cập nhật Sizes (Parse JSON)
    if (req.body.sizes) {
        try { food.sizes = JSON.parse(req.body.sizes); } catch(e) {}
    }

    // Cập nhật Options
    if (req.body.options) {
        try { food.options = JSON.parse(req.body.options); } catch(e) {}
    }

    // Cập nhật Crust
    if (req.body.crustEnabled !== undefined) {
       food.crust.enabled = req.body.crustEnabled === "true" || req.body.crustEnabled === true;
    }
    if (req.body.crustList) {
        try { food.crust.list = JSON.parse(req.body.crustList); } catch(e) {}
    }

    await food.save();

    res.json({ success: true, message: "Cập nhật thành công!", data: food });
  } catch (error) {
    console.error("Update food error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật!" });
  }
};

/* ---------------------------------------------
   GET HELPERS
--------------------------------------------- */
export const listCategories = async (req, res) => {
  try {
    const foods = await foodModel.find({}, "category");
    const categories = [...new Set(foods.map((f) => f.category))];
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

export const getFoodByCategory = async (req, res) => {
  try {
    const { name } = req.params;
    const foods = await foodModel.find({ category: name });
    res.json({ success: true, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await foodModel.findById(id);
    if (!food) return res.json({ success: false, message: "Not found" });
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};