import React from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
// Import các icon từ react-icons/fi
import {
  FiGrid,
  FiPlusSquare,
  FiList,
  FiPackage,
  FiUsers,
  FiPercent,
} from "react-icons/fi";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/dashboard" className="sidebar-option">
          <FiGrid className="sidebar-icon" />
          <p>Dashboard</p>
        </NavLink>

        <NavLink to="/add" className="sidebar-option">
          <FiPlusSquare className="sidebar-icon" />
          <p>Thêm món</p>
        </NavLink>

        <NavLink to="/productlist" className="sidebar-option">
          <FiList className="sidebar-icon" />
          <p>Danh sách món</p>
        </NavLink>

        <NavLink to="/orderlist" className="sidebar-option">
          <FiPackage className="sidebar-icon" />
          <p>Đơn hàng</p>
        </NavLink>

        <NavLink to="/promotion" className="sidebar-option">
          <FiPercent className="sidebar-icon" />
          <p>Khuyến mãi</p>
        </NavLink>

        <NavLink to="/users" className="sidebar-option">
          <FiUsers className="sidebar-icon" />
          <p>Người dùng</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
