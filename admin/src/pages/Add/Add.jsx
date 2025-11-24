import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
// 👇 Import thêm icon FiLayers cho đẹp
import { FiUploadCloud, FiPlus, FiX, FiLayers } from "react-icons/fi";
import "./Add.css";

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Pizza",
    sizes: [],
    options: [], // Topping
    crust: [], // 👇 Mới: Đế bánh
  });

  // State tạm để nhập liệu
  const [newSize, setNewSize] = useState({ label: "", price: 0 });
  const [newOption, setNewOption] = useState({ label: "", price: "" });
  // 👇 Mới: State tạm cho Đế
  const [newCrust, setNewCrust] = useState({ label: "", price: "" });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- SIZE HANDLERS ---
  const handleAddSize = () => {
    if (!newSize.label.trim()) return toast.warn("Nhập tên kích cỡ!");
    setData((prev) => ({ ...prev, sizes: [...prev.sizes, newSize] }));
    setNewSize({ label: "", price: 0 });
  };
  const removeSize = (idx) => {
    setData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== idx),
    }));
  };

  // --- TOPPING (OPTION) HANDLERS ---
  const handleAddOption = () => {
    if (!newOption.label.trim()) return toast.warn("Nhập tên tùy chọn!");
    setData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { label: newOption.label, price: Number(newOption.price) || 0 },
      ],
    }));
    setNewOption({ label: "", price: "" });
  };
  const removeOption = (idx) => {
    setData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  };

  // --- CRUST HANDLERS (MỚI) ---
  const handleAddCrust = () => {
    if (!newCrust.label.trim()) return toast.warn("Nhập tên đế bánh!");
    setData((prev) => ({
      ...prev,
      crust: [
        ...prev.crust,
        { label: newCrust.label, price: Number(newCrust.price) || 0 },
      ],
    }));
    setNewCrust({ label: "", price: "" });
  };
  const removeCrust = (idx) => {
    setData((prev) => ({
      ...prev,
      crust: prev.crust.filter((_, i) => i !== idx),
    }));
  };

  // --- SUBMIT ---
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

    // 👇 Gửi thông tin Đế bánh
    // Backend của bạn cần nhận: crustList (mảng) và crustEnabled (boolean)
    formData.append("crustList", JSON.stringify(data.crust));
    formData.append("crustEnabled", data.crust.length > 0);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        toast.success("Thêm món thành công!");
        // Reset form
        setData({
          name: "",
          description: "",
          price: "",
          category: "Pizza",
          sizes: [],
          options: [],
          crust: [],
        });
        setImage(false);
        setPreviewUrl("");
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Lỗi kết nối server!");
    }
  };

  return (
    <div className="add-container">
      <div className="add-header">
        <h2>Thêm món ăn mới</h2>
      </div>

      <form className="add-form" onSubmit={onSubmitHandler}>
        {/* --- CỘT TRÁI: THÔNG TIN CHÍNH --- */}
        <div className="form-card">
          <div className="input-group">
            <label>Tên món ăn</label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={onChangeHandler}
              placeholder="VD: Pizza Hải Sản"
              required
            />
          </div>

          <div className="input-group">
            <label>Mô tả chi tiết</label>
            <textarea
              name="description"
              rows="4"
              value={data.description}
              onChange={onChangeHandler}
              placeholder="Mô tả thành phần, hương vị..."
              required
            ></textarea>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Danh mục</label>
              <select
                name="category"
                value={data.category}
                onChange={onChangeHandler}
              >
                <option value="Pizza">Pizza</option>
                <option value="Sandwich">Burger</option>
                <option value="Chickens">Gà Rán</option>
                <option value="Spaghetti">Mì Ý</option>
                <option value="Salad">Salad</option>
                <option value="Deserts">Tráng Miệng</option>
                <option value="Drinks">Đồ Uống</option>
              </select>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label>Giá gốc (VNĐ)</label>
              <input
                type="number"
                name="price"
                value={data.price}
                onChange={onChangeHandler}
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: ẢNH & BIẾN THỂ --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Upload Ảnh */}
          <div className="form-card">
            <label
              style={{ fontWeight: 600, marginBottom: 8, display: "block" }}
            >
              Hình ảnh sản phẩm
            </label>
            <label htmlFor="image" className="upload-area">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="preview-img" />
              ) : (
                <div className="upload-placeholder">
                  <FiUploadCloud size={40} color="#ccc" />
                  <p>Kéo thả hoặc click để tải ảnh lên</p>
                </div>
              )}
            </label>
            <input
              onChange={handleImageChange}
              type="file"
              id="image"
              hidden
              required={!previewUrl}
            />
          </div>

          {/* BIẾN THỂ (Size, Crust, Topping) */}
          <div className="form-card">
            {/* 1. Size */}
            <div className="variant-box">
              <div className="variant-header">Kích cỡ (Size)</div>
              <div className="variant-input-row">
                <input
                  placeholder="Tên (Vừa)"
                  value={newSize.label}
                  onChange={(e) =>
                    setNewSize({ ...newSize, label: e.target.value })
                  }
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Giá thêm"
                  value={newSize.price}
                  onChange={(e) =>
                    setNewSize({ ...newSize, price: e.target.value })
                  }
                  style={{ width: "80px" }}
                />
                <button
                  type="button"
                  className="btn-add"
                  onClick={handleAddSize}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="tags-container">
                {data.sizes.map((s, i) => (
                  <div key={i} className="tag-item">
                    {s.label} (+{Number(s.price).toLocaleString()})
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeSize(i)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Crust (Đế bánh) - MỚI */}
            <div className="variant-box">
              <div
                className="variant-header"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FiLayers /> Đế bánh (Crust)
              </div>
              <div className="variant-input-row">
                <input
                  placeholder="Tên (Đế mỏng)"
                  value={newCrust.label}
                  onChange={(e) =>
                    setNewCrust({ ...newCrust, label: e.target.value })
                  }
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Giá thêm"
                  value={newCrust.price}
                  onChange={(e) =>
                    setNewCrust({ ...newCrust, price: e.target.value })
                  }
                  style={{ width: "80px" }}
                />
                <button
                  type="button"
                  className="btn-add"
                  onClick={handleAddCrust}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="tags-container">
                {data.crust.map((c, i) => (
                  <div key={i} className="tag-item">
                    {c.label} (+{Number(c.price).toLocaleString()})
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeCrust(i)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Topping */}
            <div className="variant-box">
              <div className="variant-header">Topping (Tùy chọn)</div>
              <div className="variant-input-row">
                <input
                  placeholder="Tên (Phô mai)"
                  value={newOption.label}
                  onChange={(e) =>
                    setNewOption({ ...newOption, label: e.target.value })
                  }
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Giá"
                  value={newOption.price}
                  onChange={(e) =>
                    setNewOption({ ...newOption, price: e.target.value })
                  }
                  style={{ width: "80px" }}
                />
                <button
                  type="button"
                  className="btn-add"
                  onClick={handleAddOption}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="tags-container">
                {data.options.map((o, i) => (
                  <div key={i} className="tag-item">
                    {o.label} (+{Number(o.price).toLocaleString()})
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeOption(i)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER: SUBMIT --- */}
        <div className="submit-area">
          <button type="submit" className="btn-submit">
            THÊM SẢN PHẨM MỚI
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;
