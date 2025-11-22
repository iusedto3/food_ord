import React, { useState, useContext, useEffect, useRef } from "react";
import "./Navbar.css";
import { BiCart, BiSolidUserDetail } from "react-icons/bi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import { assets } from "../../assets/assets";

const Navbar = ({ setShowLogin }) => {
  const { token, setToken, cartItems } = useContext(StoreContext);
  const [openDropdown, setOpenDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const location = useLocation();

  // 🧩 Tính tổng số lượng món trong giỏ
  const totalItems = Object.values(cartItems || {}).reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);

  // 🔐 Đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setOpenDropdown(false);
    navigate("/");
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showIcons = !["/cart", "/checkout"].includes(location.pathname);

  return (
    <div className="navbar">
      {/* 🏠 Logo giữa */}
      <div className="navbar-center">
        <Link to="/">
          <img src={assets.logo} alt="Logo" className="navbar-logo" />
        </Link>
      </div>

      {/* 🛒 & 👤 Phải */}
      {showIcons && (
        <div className="navbar-right">
          <div className="navbar-cart">
            <Link to="/cart">
              <BiCart className="icon" />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>
          </div>

          <div className="navbar-profile" ref={dropdownRef}>
            <BiSolidUserDetail
              className={`icon profile-icon ${openDropdown ? "open" : ""} ${
                token ? "logged-in" : ""
              }`}
              onClick={() => setOpenDropdown(!openDropdown)}
            />
            {openDropdown && (
              <ul className={`dropdown ${openDropdown ? "open" : ""}`}>
                {!token ? (
                  <>
                    <li>
                      <Link
                        to="/sign-in"
                        onClick={() => setOpenDropdown(false)}
                      >
                        Đăng nhập
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/sign-up"
                        onClick={() => setOpenDropdown(false)}
                      >
                        Đăng ký
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/track-order"
                        onClick={() => setOpenDropdown(false)}
                      >
                        Theo dõi đơn hàng
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/myprofile"
                        onClick={() => setOpenDropdown(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/track-order"
                        onClick={() => setOpenDropdown(false)}
                      >
                        Theo dõi đơn hàng
                      </Link>
                    </li>
                    <li onClick={logout}>Đăng xuất</li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
