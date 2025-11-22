import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/dashboard" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Dashboard</p>
        </NavLink>
        <NavLink to="/add" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to="/productlist" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Items</p>
        </NavLink>
        <NavLink to="/promotion" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Promotion</p>
        </NavLink>
        <NavLink to="/orderlist" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        <NavLink to="/user" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>User</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
