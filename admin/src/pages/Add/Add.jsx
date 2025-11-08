import React, { useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
    sizes: ["Vừa", "Lớn"], // mặc định
    options: [],
  });

  const [newSize, setNewSize] = useState("");
  const [newOption, setNewOption] = useState({ label: "", price: "" });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟢 Thêm size mới
  const handleAddSize = () => {
    if (!newSize.trim()) return toast.warn("Nhập tên kích cỡ!");
    if (data.sizes.includes(newSize))
      return toast.warn("Kích cỡ này đã tồn tại!");
    setData((prev) => ({ ...prev, sizes: [...prev.sizes, newSize] }));
    setNewSize("");
  };

  // 🔴 Xóa size
  const handleRemoveSize = (index) => {
    setData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // 🟢 Thêm tuỳ chọn
  const handleAddOption = () => {
    if (!newOption.label.trim()) return toast.warn("Nhập tên tùy chọn!");
    const price = Number(newOption.price) || 0;
    setData((prev) => ({
      ...prev,
      options: [...prev.options, { label: newOption.label, price }],
    }));
    setNewOption({ label: "", price: "" });
  };

  // 🔴 Xóa tuỳ chọn
  const handleRemoveOption = (index) => {
    setData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  // 🧾 Gửi dữ liệu
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);
    formData.append("sizes", JSON.stringify(data.sizes));
    formData.append("options", JSON.stringify(data.options));

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        toast.success("Đã thêm món ăn thành công!");
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad",
          sizes: ["Vừa", "Lớn"],
          options: [],
        });
        setImage(false);
      } else {
        toast.error(response.data.message || "Lỗi thêm món!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối server!");
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        {/* --- Upload hình --- */}
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt=""
            />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
          />
        </div>

        {/* --- Thông tin món --- */}
        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write here"
          ></textarea>
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select
              name="category"
              id="category"
              onChange={onChangeHandler}
              value={data.category}
            >
              <option value="Pizza">Pizza</option>
              <option value="Sandwich">Hamburger</option>
              <option value="Chickens">Ghiền Gà</option>
              <option value="Spaghetti">Mì Ý</option>
              <option value="Salad">Salad</option>
              <option value="Deserts">Tráng Miệng</option>
              <option value="Drinks">Giải Khát</option>
            </select>
          </div>

          <div className="add-price flex-col">
            <p>Product price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              name="price"
              placeholder="VND"
            />
          </div>
        </div>

        {/* --- Quản lý kích cỡ --- */}
        <div className="add-sizes flex-col">
          <p>Kích cỡ món ăn</p>
          <div className="size-inputs">
            <input
              type="text"
              placeholder="VD: Nhỏ, Vừa, Lớn..."
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
            />
            <button type="button" onClick={handleAddSize}>
              Thêm
            </button>
          </div>
          <ul className="size-list">
            {data.sizes.map((s, index) => (
              <li key={index} className="size-item">
                <span>{s}</span>
                <button type="button" onClick={() => handleRemoveSize(index)}>
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Tuỳ chọn thêm --- */}
        <div className="add-options flex-col">
          <p>Tuỳ chọn thêm</p>
          <div className="option-inputs">
            <input
              type="text"
              placeholder="Tên tuỳ chọn (VD: Thêm phô mai)"
              value={newOption.label}
              onChange={(e) =>
                setNewOption((p) => ({ ...p, label: e.target.value }))
              }
            />
            <input
              type="number"
              placeholder="Giá (VND)"
              value={newOption.price}
              onChange={(e) =>
                setNewOption((p) => ({ ...p, price: e.target.value }))
              }
            />
            <button type="button" onClick={handleAddOption}>
              Thêm
            </button>
          </div>

          <ul className="option-list">
            {data.options.map((opt, index) => (
              <li key={index} className="option-item">
                <span>
                  {opt.label} — {opt.price.toLocaleString()}đ
                </span>
                <button type="button" onClick={() => handleRemoveOption(index)}>
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="add-btn">
          ADD
        </button>
      </form>
    </div>
  );
};

export default Add;
