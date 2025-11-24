import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiX, FiTrash2, FiPlus, FiImage } from "react-icons/fi"; // Import Icon
import "./EditFoodModal.css";

const API_URL = "http://localhost:4000/api/food";
const IMG_URL = "http://localhost:4000/images"; // URL folder ảnh backend

const EditFoodModal = ({ foodId, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(true);

  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(""); // Xem trước ảnh

  const [sizes, setSizes] = useState([]);
  const [options, setOptions] = useState([]);
  const [crustEnabled, setCrustEnabled] = useState(false);
  const [crustList, setCrustList] = useState([]);

  // Load Data
  useEffect(() => {
    const fetchFood = async () => {
      try {
        // Gọi API lấy chi tiết 1 món (đã tạo ở bước trước)
        const res = await axios.get(`${API_URL}/detail/${foodId}`);

        if (res.data.success) {
          // 👇 SỬA Ở ĐÂY: Lấy thẳng data, KHÔNG DÙNG .find() nữa
          // Vì API trả về: { success: true, data: { _id: "...", name: "..." } }
          const found = res.data.data;

          // Set dữ liệu vào form
          setName(found.name);
          setPrice(found.price);
          setCategory(found.category);
          setDescription(found.description);

          // Preview ảnh
          // Kiểm tra nếu có ảnh thì nối URL, không thì để trống
          if (found.image) {
            setPreviewUrl(`${IMG_URL}/${found.image}`);
          }

          setSizes(found.sizes || []);
          setOptions(found.options || []);
          setCrustEnabled(found?.crust?.enabled || false);
          setCrustList(found?.crust?.list || []);
        } else {
          alert("Không tìm thấy thông tin món ăn!");
          onClose();
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    if (foodId) {
      fetchFood();
    }
  }, [foodId]);

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Tạo URL tạm để xem trước
    }
  };

  // CRUD Handlers (Refactored for clean code)
  const handleArrayChange = (setter, list, index, field, value) => {
    const updated = [...list];
    updated[index][field] = value;
    setter(updated);
  };
  const handleArrayRemove = (setter, list, index) => {
    setter(list.filter((_, i) => i !== index));
  };
  const handleArrayAdd = (setter, list) => {
    setter([...list, { label: "", price: 0 }]);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("options", JSON.stringify(options));
      formData.append("crustEnabled", crustEnabled);
      formData.append("crustList", JSON.stringify(crustList));
      if (imageFile) formData.append("image", imageFile);

      await axios.put(`${API_URL}/update/${foodId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdated();
      onClose();
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
  };

  if (loading) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        {/* HEADER */}
        <div className="modal-header">
          <h2>Chỉnh sửa món ăn</h2>
          <button className="close-icon-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* BODY (2 Cột) */}
        <div className="modal-body">
          {/* --- CỘT TRÁI: THÔNG TIN CƠ BẢN --- */}
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
                <label>Giá gốc (VNĐ)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Danh mục</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Toppings & Options */}
            <div className="variant-block">
              <div className="variant-header">
                <h4>Topping (Tùy chọn)</h4>
                <button
                  className="btn-add-variant"
                  onClick={() => handleArrayAdd(setOptions, options)}
                >
                  <FiPlus /> Thêm Topping
                </button>
              </div>
              {options.map((o, i) => (
                <div key={i} className="variant-row">
                  <input
                    placeholder="Tên (vd: Phô mai)"
                    value={o.label}
                    onChange={(e) =>
                      handleArrayChange(
                        setOptions,
                        options,
                        i,
                        "label",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Giá thêm"
                    value={o.price}
                    onChange={(e) =>
                      handleArrayChange(
                        setOptions,
                        options,
                        i,
                        "price",
                        e.target.value
                      )
                    }
                    style={{ width: "100px" }}
                  />
                  <button
                    className="btn-icon"
                    onClick={() => handleArrayRemove(setOptions, options, i)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* --- CỘT PHẢI: ẢNH & BIẾN THỂ --- */}
          <div className="form-column">
            {/* Image Preview */}
            <div className="form-group">
              <label>Hình ảnh</label>
              <div className="image-upload-box">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="preview-img" />
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

            {/* Sizes */}
            <div className="variant-block">
              <div className="variant-header">
                <h4>Kích cỡ (Size)</h4>
                <button
                  className="btn-add-variant"
                  onClick={() => handleArrayAdd(setSizes, sizes)}
                >
                  <FiPlus /> Thêm Size
                </button>
              </div>
              {sizes.map((s, i) => (
                <div key={i} className="variant-row">
                  <input
                    placeholder="Tên (vd: Lớn)"
                    value={s.label}
                    onChange={(e) =>
                      handleArrayChange(
                        setSizes,
                        sizes,
                        i,
                        "label",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Giá"
                    value={s.price}
                    onChange={(e) =>
                      handleArrayChange(
                        setSizes,
                        sizes,
                        i,
                        "price",
                        e.target.value
                      )
                    }
                    style={{ width: "100px" }}
                  />
                  <button
                    className="btn-icon"
                    onClick={() => handleArrayRemove(setSizes, sizes, i)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            {/* Crust */}
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
                {crustEnabled && (
                  <button
                    className="btn-add-variant"
                    onClick={() => handleArrayAdd(setCrustList, crustList)}
                  >
                    <FiPlus /> Thêm Đế
                  </button>
                )}
              </div>

              {crustEnabled &&
                crustList.map((c, i) => (
                  <div key={i} className="variant-row">
                    <input
                      placeholder="Tên (vd: Đế mỏng)"
                      value={c.label}
                      onChange={(e) =>
                        handleArrayChange(
                          setCrustList,
                          crustList,
                          i,
                          "label",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="number"
                      placeholder="Giá"
                      value={c.price}
                      onChange={(e) =>
                        handleArrayChange(
                          setCrustList,
                          crustList,
                          i,
                          "price",
                          e.target.value
                        )
                      }
                      style={{ width: "100px" }}
                    />
                    <button
                      className="btn-icon"
                      onClick={() =>
                        handleArrayRemove(setCrustList, crustList, i)
                      }
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
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
