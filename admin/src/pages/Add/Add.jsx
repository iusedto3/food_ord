import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUploadCloud, FiPlus, FiX, FiLayers, FiTrash2 } from "react-icons/fi";
import "./Add.css";

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "", // Giá gốc (Size M)
    category: "Pizza",
    sizes: { S: 0, M: 0, L: 0 },
    options: [],
    crust: [],
  });

  // Toggle tự động tính
  const [autoCalcSize, setAutoCalcSize] = useState(true); // Cho giá bánh chính
  const [autoCalcCrust, setAutoCalcCrust] = useState(true); // 🟢 MỚI: Cho đế bánh

  const [newOption, setNewOption] = useState({ label: "", price: "" });
  const [newCrust, setNewCrust] = useState({
    label: "",
    prices: { S: 0, M: 0, L: 0 },
  });

  // --- 1. LOGIC TỰ ĐỘNG TÍNH GIÁ BÁNH ---
  useEffect(() => {
    if (autoCalcSize && data.price) {
      const basePrice = Number(data.price);
      setData((prev) => ({
        ...prev,
        sizes: {
          S: Math.round(basePrice * 0.8),
          M: basePrice,
          L: Math.round(basePrice * 1.35),
        },
      }));
    }
  }, [data.price, autoCalcSize]);

  // --- 2. LOGIC TỰ ĐỘNG TÍNH GIÁ ĐẾ (KHI NHẬP INPUT M) ---
  const handleNewCrustPriceMChange = (val) => {
    const priceM = Number(val);

    if (autoCalcCrust) {
      setNewCrust((prev) => ({
        ...prev,
        prices: {
          S: Math.round(priceM * 0.8),
          M: priceM,
          L: Math.round(priceM * 1.35),
        },
      }));
    } else {
      // Nếu tắt tự động, chỉ update giá M
      setNewCrust((prev) => ({
        ...prev,
        prices: { ...prev.prices, M: priceM },
      }));
    }
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (sizeKey, value) => {
    setData((prev) => ({
      ...prev,
      sizes: { ...prev.sizes, [sizeKey]: Number(value) },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- OPTION HANDLERS ---
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

  // --- CRUST HANDLERS ---
  const handleAddCrust = () => {
    if (!newCrust.label.trim()) return toast.warn("Nhập tên đế bánh!");
    setData((prev) => ({
      ...prev,
      crust: [...prev.crust, newCrust],
    }));
    setNewCrust({ label: "", prices: { S: 0, M: 0, L: 0 } });
  };

  const removeCrust = (idx) => {
    setData((prev) => ({
      ...prev,
      crust: prev.crust.filter((_, i) => i !== idx),
    }));
  };

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
    formData.append("crustList", JSON.stringify(data.crust));
    formData.append("crustEnabled", data.crust.length > 0);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        toast.success("Thêm món thành công!");
        setData({
          name: "",
          description: "",
          price: "",
          category: "Pizza",
          sizes: { S: 0, M: 0, L: 0 },
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
        {/* --- CỘT TRÁI --- */}
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
              placeholder="Mô tả thành phần..."
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
              <label>Giá gốc (Size M)</label>
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

        {/* --- CỘT PHẢI --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="form-card">
            <label
              style={{ fontWeight: 600, marginBottom: 8, display: "block" }}
            >
              Hình ảnh
            </label>
            <label htmlFor="image" className="upload-area">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="preview-img" />
              ) : (
                <div className="upload-placeholder">
                  <FiUploadCloud size={40} color="#ccc" />
                  <p>Tải ảnh lên</p>
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

          {/* SIZE SECTION */}
          <div className="form-card">
            <div className="variant-box">
              <div
                className="variant-header"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Kích cỡ (Size)</span>
                <label
                  style={{
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: "normal",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={autoCalcSize}
                    onChange={(e) => setAutoCalcSize(e.target.checked)}
                  />
                  Tự động tính
                </label>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <div style={{ flex: 1 }}>
                  <small style={{ color: "#666" }}>Nhỏ (S)</small>
                  <input
                    type="number"
                    value={data.sizes.S}
                    onChange={(e) => handleSizeChange("S", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <small style={{ color: "#666" }}>Vừa (M)</small>
                  <input
                    type="number"
                    value={data.sizes.M}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      background: "#f5f5f5",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <small style={{ color: "#666" }}>Lớn (L)</small>
                  <input
                    type="number"
                    value={data.sizes.L}
                    onChange={(e) => handleSizeChange("L", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CRUST SECTION */}
            <div className="variant-box">
              <div
                className="variant-header"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>
                  <FiLayers /> Đế bánh (Crust)
                </span>
                {/* 🟢 CHECKBOX TỰ ĐỘNG TÍNH GIÁ ĐẾ */}
                <label
                  style={{
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: "normal",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={autoCalcCrust}
                    onChange={(e) => setAutoCalcCrust(e.target.checked)}
                  />
                  Tự động tính
                </label>
              </div>

              {/* Form Input Đế */}
              <div
                style={{
                  background: "#fff",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #eee",
                  marginBottom: "10px",
                }}
              >
                <input
                  placeholder="Tên đế (Vd: Viền phô mai)"
                  value={newCrust.label}
                  onChange={(e) =>
                    setNewCrust({ ...newCrust, label: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />

                <div
                  style={{ display: "flex", gap: "5px", alignItems: "center" }}
                >
                  {/* INPUT GIÁ S */}
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="S"
                      value={newCrust.prices.S}
                      onChange={(e) =>
                        setNewCrust({
                          ...newCrust,
                          prices: { ...newCrust.prices, S: e.target.value },
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "6px",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  {/* INPUT GIÁ M (TRIGGER TỰ ĐỘNG TÍNH) */}
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="M (Gốc)"
                      value={newCrust.prices.M}
                      // 🟢 Gọi hàm tính toán ở đây
                      onChange={(e) =>
                        handleNewCrustPriceMChange(e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "6px",
                        fontSize: "13px",
                        border: "1px solid #2196f3",
                      }}
                    />
                  </div>

                  {/* INPUT GIÁ L */}
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="L"
                      value={newCrust.prices.L}
                      onChange={(e) =>
                        setNewCrust({
                          ...newCrust,
                          prices: { ...newCrust.prices, L: e.target.value },
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "6px",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-add"
                    onClick={handleAddCrust}
                  >
                    <FiPlus />
                  </button>
                </div>
                <small
                  style={{
                    fontSize: "10px",
                    color: "#999",
                    display: "block",
                    marginTop: "4px",
                  }}
                >
                  Nhập giá Size M để tự động tính S và L
                </small>
              </div>

              {/* Danh sách đã thêm */}
              <div
                className="tags-container"
                style={{ flexDirection: "column", gap: "5px" }}
              >
                {data.crust.map((c, i) => (
                  <div
                    key={i}
                    className="tag-item"
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <div>
                      <strong>{c.label}</strong>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          marginLeft: "8px",
                        }}
                      >
                        (S: {Number(c.prices.S).toLocaleString()}, M:{" "}
                        {Number(c.prices.M).toLocaleString()}, L:{" "}
                        {Number(c.prices.L).toLocaleString()})
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeCrust(i)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TOPPING */}
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
