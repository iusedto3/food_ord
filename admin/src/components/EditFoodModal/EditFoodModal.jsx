import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiX, FiTrash2, FiPlus, FiImage, FiLayers } from "react-icons/fi";
import "./EditFoodModal.css";
import { toast } from "react-toastify";

// Sửa lại URL cho đúng với cấu hình của bạn
const API_URL = "http://localhost:4000/api/food";
const IMG_URL = "http://localhost:4000/images";

const EditFoodModal = ({ foodId, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(true);

  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0); // Giá gốc (Size M)
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // 🟢 STATE MỚI: Size là Object, không phải Array
  const [sizePrices, setSizePrices] = useState({ S: 0, M: 0, L: 0 });

  const [autoCalc, setAutoCalc] = useState(false); // Mặc định tắt auto khi edit để tránh nhảy giá
  const [crustEnabled, setCrustEnabled] = useState(false);
  const [crustList, setCrustList] = useState([]);
  const [options, setOptions] = useState([]); // Topping

  // State tạm để thêm
  const [newOption, setNewOption] = useState({ label: "", price: "" });
  const [newCrust, setNewCrust] = useState({
    label: "",
    prices: { S: 0, M: 0, L: 0 },
  });

  // Load Data
  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await axios.get(`${API_URL}/detail/${foodId}`);
        if (res.data.success) {
          const found = res.data.data;

          setName(found.name);
          setPrice(found.price);
          setCategory(found.category);
          setDescription(found.description);
          if (found.image) setPreviewUrl(`${IMG_URL}/${found.image}`);

          // 🟢 LOAD SIZE: Kiểm tra xem DB đang lưu kiểu cũ (mảng) hay kiểu mới (object)
          if (found.sizes && !Array.isArray(found.sizes)) {
            setSizePrices(found.sizes);
          } else {
            // Nếu là data cũ hoặc chưa có, set mặc định
            setSizePrices({ S: 0, M: found.price, L: 0 });
          }

          setOptions(found.options || []);
          setCrustEnabled(found?.crust?.enabled || false);
          setCrustList(found?.crust?.list || []);
        } else {
          toast.error("Không tìm thấy món!");
          onClose();
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (foodId) fetchFood();
  }, [foodId]);

  // 🟢 AUTO CALC (Chỉ chạy khi bật checkbox)
  useEffect(() => {
    if (autoCalc && price > 0) {
      setSizePrices({
        S: Math.round(price * 0.8),
        M: Number(price),
        L: Math.round(price * 1.35),
      });
    }
  }, [price, autoCalc]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- SIZE HANDLER ---
  const handleSizeChange = (key, val) => {
    setSizePrices((prev) => ({
      ...prev,
      [key]: Number(val),
    }));
  };

  // --- TOPPING HANDLERS ---
  const handleAddOption = () => {
    if (!newOption.label) return;
    setOptions([...options, { ...newOption, price: Number(newOption.price) }]);
    setNewOption({ label: "", price: "" });
  };

  // --- CRUST HANDLERS ---
  const handleAddCrust = () => {
    if (!newCrust.label) return;
    setCrustList([...crustList, newCrust]);
    setNewCrust({ label: "", prices: { S: 0, M: 0, L: 0 } });
  };

  const handleCrustChange = (index, field, value, sizeKey = null) => {
    const updated = [...crustList];
    if (sizeKey) {
      if (!updated[index].prices) updated[index].prices = { S: 0, M: 0, L: 0 };
      updated[index].prices[sizeKey] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setCrustList(updated);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);

      // 🟢 Gửi Object Size
      formData.append("sizes", JSON.stringify(sizePrices));

      formData.append("options", JSON.stringify(options));
      formData.append("crustEnabled", crustEnabled);
      formData.append("crustList", JSON.stringify(crustList));
      if (imageFile) formData.append("image", imageFile);

      await axios.put(`${API_URL}/update/${foodId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Cập nhật thành công!");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error("Cập nhật thất bại!");
    }
  };

  if (loading) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="modal-header">
          <h2>Chỉnh sửa món ăn</h2>
          <button className="close-icon-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* CỘT TRÁI */}
          <div className="form-column">
            <div className="form-group">
              <label>Tên món</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div
              className="form-group"
              style={{ display: "flex", gap: "15px" }}
            >
              <div style={{ flex: 1 }}>
                <label>Giá gốc (M)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Danh mục</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                  }}
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
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* 🟢 KHU VỰC SIZE (SỬA LẠI HOÀN TOÀN) */}
            <div className="variant-block">
              <div
                className="variant-header"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h4>Kích cỡ (Size)</h4>
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
                    checked={autoCalc}
                    onChange={(e) => setAutoCalc(e.target.checked)}
                  />
                  Tự động tính
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                <div style={{ flex: 1 }}>
                  <small>Nhỏ (S)</small>
                  <input
                    type="number"
                    value={sizePrices.S}
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
                  <small>Vừa (M)</small>
                  <input
                    type="number"
                    value={sizePrices.M}
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
                  <small>Lớn (L)</small>
                  <input
                    type="number"
                    value={sizePrices.L}
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

            {/* Topping */}
            <div className="variant-block">
              <div className="variant-header">
                <h4>Topping</h4>
              </div>
              <div
                className="variant-input-row"
                style={{ display: "flex", gap: "5px" }}
              >
                <input
                  placeholder="Tên"
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
                <button className="btn-icon" onClick={handleAddOption}>
                  <FiPlus />
                </button>
              </div>
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  marginTop: "10px",
                }}
              >
                {options.map((o, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "5px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <span>
                      {o.label} (+{Number(o.price).toLocaleString()})
                    </span>
                    <FiTrash2
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() =>
                        setOptions(options.filter((_, idx) => idx !== i))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="form-column">
            <div className="form-group">
              <label>Hình ảnh</label>
              <div className="image-upload-box">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="preview-img" />
                ) : (
                  <div className="preview-placeholder">
                    <FiImage size={40} />
                  </div>
                )}
                <input
                  type="file"
                  className="file-input"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* 🟢 KHU VỰC ĐẾ BÁNH (CRUST) */}
            <div className="variant-block">
              <div className="variant-header">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: 0,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={crustEnabled}
                    onChange={(e) => setCrustEnabled(e.target.checked)}
                  />
                  <span>Đế bánh (Crust)</span>
                </label>
              </div>

              {crustEnabled && (
                <div>
                  {/* Form thêm đế */}
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
                    <div style={{ display: "flex", gap: "5px" }}>
                      <input
                        type="number"
                        placeholder="Giá S"
                        value={newCrust.prices.S}
                        onChange={(e) =>
                          setNewCrust({
                            ...newCrust,
                            prices: { ...newCrust.prices, S: e.target.value },
                          })
                        }
                        style={{ flex: 1, padding: "6px" }}
                      />
                      <input
                        type="number"
                        placeholder="Giá M"
                        value={newCrust.prices.M}
                        onChange={(e) =>
                          setNewCrust({
                            ...newCrust,
                            prices: { ...newCrust.prices, M: e.target.value },
                          })
                        }
                        style={{ flex: 1, padding: "6px" }}
                      />
                      <input
                        type="number"
                        placeholder="Giá L"
                        value={newCrust.prices.L}
                        onChange={(e) =>
                          setNewCrust({
                            ...newCrust,
                            prices: { ...newCrust.prices, L: e.target.value },
                          })
                        }
                        style={{ flex: 1, padding: "6px" }}
                      />
                      <button className="btn-icon" onClick={handleAddCrust}>
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  {/* Danh sách đế */}
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {crustList.map((c, i) => (
                      <div
                        key={i}
                        className="variant-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr 1fr 1fr 0.5fr",
                          gap: "5px",
                          marginBottom: "5px",
                        }}
                      >
                        <input
                          value={c.label}
                          onChange={(e) =>
                            handleCrustChange(i, "label", e.target.value)
                          }
                        />
                        <input
                          type="number"
                          value={c.prices?.S}
                          onChange={(e) =>
                            handleCrustChange(i, null, e.target.value, "S")
                          }
                        />
                        <input
                          type="number"
                          value={c.prices?.M}
                          onChange={(e) =>
                            handleCrustChange(i, null, e.target.value, "M")
                          }
                        />
                        <input
                          type="number"
                          value={c.prices?.L}
                          onChange={(e) =>
                            handleCrustChange(i, null, e.target.value, "L")
                          }
                        />
                        <button
                          className="btn-icon"
                          onClick={() =>
                            setCrustList(
                              crustList.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy bỏ
          </button>
          <button className="btn-save" onClick={handleSubmit}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFoodModal;
