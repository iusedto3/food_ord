import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiLock,
  FiUnlock,
  FiUser,
  FiTrash2,
  FiEdit,
  FiPlus,
} from "react-icons/fi";
import "./Users.css";
import UserModal from "../../components/EditUserModal/EditUserModal.jsx";

const Users = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${url}/api/user/list`);
      if (res.data.success) {
        setUsers(res.data.data.reverse());
        setFilteredUsers(res.data.data);
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const result = users.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      );
      setFilteredUsers(result);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // --- HANDLERS ---

  // 1. Mở Modal Thêm
  const handleAdd = () => {
    setEditingUser(null); // Reset user đang sửa
    setShowModal(true);
  };

  // 2. Mở Modal Sửa
  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  // 3. Xóa User
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn chắc chắn muốn xóa người dùng này? Hành động không thể hoàn tác."
      )
    )
      return;
    try {
      const res = await axios.delete(`${url}/api/user/delete/${id}`);
      if (res.data.success) {
        toast.success("Đã xóa user!");
        fetchUsers();
      } else {
        toast.error("Lỗi khi xóa");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    }
  };

  // // 4. Khóa/Mở khóa
  // const toggleStatus = async (userId, currentStatus) => {
  //   if (
  //     !window.confirm(
  //       `Bạn muốn ${currentStatus ? "MỞ KHÓA" : "KHÓA"} tài khoản này?`
  //     )
  //   )
  //     return;
  //   try {
  //     const res = await axios.post(`${url}/api/user/status`, {
  //       userId,
  //       isBlocked: !currentStatus,
  //     });
  //     if (res.data.success) {
  //       toast.success(res.data.message);
  //       fetchUsers();
  //     }
  //   } catch (err) {
  //     toast.error("Lỗi cập nhật");
  //   }
  // };

  return (
    <div className="product-list-container">
      <div className="header-row">
        <h2>Quản lý Người dùng</h2>

        <div className="controls">
          <div className="search-box" style={{ width: "250px" }}>
            <FiSearch className="icon" />
            <input
              className="search-input"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Nút Thêm Mới */}
          <button
            className="btn btn-bulk"
            style={{ backgroundColor: "#2e7d32" }}
            onClick={handleAdd}
          >
            <FiPlus /> Thêm User
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Thông tin</th>
              <th>Vai trò</th>
              {/* <th>Trạng thái</th> */}
              <th>Ngày tạo</th>
              <th style={{ textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-avatar-placeholder">
                    <FiUser />
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "600", color: "#333" }}>
                      {user.name}
                    </span>
                    <small style={{ color: "#777" }}>{user.email}</small>
                    <small style={{ color: "#777" }}>{user.phone}</small>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge-role ${
                      user.role === "admin" ? "admin" : "user"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                </td>
                {/* <td>
                  {user.isBlocked ? (
                    <span className="badge-status unavailable">Đã khóa</span>
                  ) : (
                    <span className="badge-status available">Hoạt động</span>
                  )}
                </td> */}
                <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>

                <td style={{ textAlign: "center" }}>
                  <div className="action-buttons">
                    {/* Nút Sửa */}
                    <button
                      className="btn-icon edit"
                      onClick={() => handleEdit(user)}
                      title="Thông tin"
                    >
                      <FiEdit />
                    </button>

                    {/* Nút Khóa
                    <button
                      className={`btn-icon ${
                        user.isBlocked ? "unlock" : "lock"
                      }`}
                      title={user.isBlocked ? "Mở khóa" : "Khóa tài khoản"}
                      onClick={() => toggleStatus(user._id, user.isBlocked)}
                    >
                      {user.isBlocked ? <FiUnlock /> : <FiLock />}
                    </button> */}

                    {/* Nút Xóa */}
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(user._id)}
                      title="Xóa vĩnh viễn"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HIỂN THỊ MODAL */}
      {showModal && (
        <UserModal
          url={url}
          user={editingUser} // Nếu null -> Form Thêm, Nếu có -> Form Sửa
          onClose={() => setShowModal(false)}
          refreshData={fetchUsers}
        />
      )}
    </div>
  );
};

export default Users;
