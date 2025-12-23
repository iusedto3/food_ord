import React, { useState, useContext, useEffect, useRef } from "react";
import "./Navbar.css";
import { BiCart, BiSolidUserDetail } from "react-icons/bi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import { assets } from "../../assets/assets";
// Đã xóa import FiBox, FiLogOut, FiUser

const Navbar = ({ setShowLogin }) => {
  const { token, setToken, cartItems } = useContext(StoreContext);
  const [openDropdown, setOpenDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Tính tổng số lượng sản phẩm trong giỏ
  const totalItems = Object.values(cartItems || {}).reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setOpenDropdown(false);
    navigate("/");
  };

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ẩn icon khi ở trang cart hoặc checkout
  const showIcons = !["/cart", "/checkout"].includes(location.pathname);

  return (
    <div className="navbar">
      <div className="navbar-center">
        <Link to="/">
          <img src={assets.logo} alt="Logo" className="navbar-logo" />
        </Link>
      </div>

      {showIcons && (
        <div className="navbar-right">
          {/* GIỎ HÀNG */}
          <div className="navbar-cart">
            <Link to="/cart">
              <BiCart className="icon" />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>
          </div>

          {/* PROFILE DROPDOWN */}
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
                  // GIAO DIỆN KHÁCH (CHƯA LOGIN)
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
                    <li
                      onClick={() => {
                        navigate("/track-order");
                        setOpenDropdown(false);
                      }}
                    >
                      <p>Tra cứu đơn hàng</p>
                    </li>
                  </>
                ) : (
                  // GIAO DIỆN USER (ĐÃ LOGIN)
                  <>
                    <li>
                      <Link
                        to="/myprofile"
                        onClick={() => setOpenDropdown(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                    </li>
                    {/* <li
                      onClick={() => {
                        navigate("/track-order");
                        setOpenDropdown(false);
                      }}
                    >
                      Đơn hàng của tôi
                    </li> */}
                    <hr />
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
