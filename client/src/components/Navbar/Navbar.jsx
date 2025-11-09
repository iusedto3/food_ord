import React, { useState, useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("menu");
  const [openProfile, setOpenProfile] = useState(false); // 👈 thêm state mới

  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="logo" className="logo" />
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          Trang Chủ
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          Thực Đơn
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          Liên hệ với chúng tôi
        </a>
      </ul>

      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button onClick={() => setShowLogin(true)}>Đăng Nhập</button>
        ) : (
          <div className="navbar-profile">
            <img
              src={assets.profile_icon}
              alt=""
              className="profile-icon"
              onClick={() => setOpenProfile(!openProfile)} // 👈 click toggle
            />
            {openProfile && ( // 👈 chỉ hiển thị khi openProfile = true
              <ul className="nav-profile-dropdown">
                <li>
                  <img src={assets.bag_icon} alt="bag" /> Đặt Hàng
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="logout" /> Đăng Xuất
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
