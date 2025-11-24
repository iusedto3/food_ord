import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./EditUserModal.css"; // Tận dụng lại CSS của EditFoodModal hoặc tạo file mới

const UserModal = ({ url, user, onClose, refreshData }) => {
  // Nếu có user truyền vào -> Chế độ Sửa, ngược lại -> Chế độ Thêm
  const isEditMode = Boolean(user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role || "user",
        password: "", // Không hiện mật khẩu cũ
      });
    }
  }, [user, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEditMode) {
        // Gọi API Sửa
        res = await axios.put(`${url}/api/user/edit`, {
          userId: user._id,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
        });
      } else {
        // Gọi API Thêm
        res = await axios.post(`${url}/api/user/add`, formData);
      }

      if (res.data.success) {
        toast.success(res.data.message);
        refreshData();
        onClose();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
    }
  };

  return (
    <div className="modal-backdrop">
      {" "}
      {/* Dùng chung class CSS modal */}
      <div className="modal-container" style={{ width: "500px" }}>
        <div className="modal-header">
          <h3>{isEditMode ? "Cập nhật User" : "Thêm User mới"}</h3>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label>Họ tên</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isEditMode}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEditMode} // Không cho sửa email
              style={isEditMode ? { backgroundColor: "#f0f0f0" } : {}}
            />
          </div>

          {/* Chỉ hiện ô nhập pass khi Thêm mới */}
          {!isEditMode && (
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isEditMode}
            />
          </div>

          {/* <div className="form-group">
            <label>Vai trò</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="user">Khách hàng (User)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div> */}

          <div
            className="modal-footer"
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-save">
              Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
