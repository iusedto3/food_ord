import React, { useState, useContext, useEffect, useRef } from "react";
import "./Navbar.css";
import { BiCart, BiSolidUserDetail } from "react-icons/bi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import { assets } from "../../assets/assets";
import { FiBox, FiLogOut, FiUser } from "react-icons/fi"; // Import icon

const Navbar = ({ setShowLogin }) => {
  const { token, setToken, cartItems } = useContext(StoreContext);
  const [openDropdown, setOpenDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const location = useLocation();

  const totalItems = Object.values(cartItems || {}).reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setOpenDropdown(false);
    navigate("/");
  };

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
      <div className="navbar-center">
        <Link to="/">
          <img src={assets.logo} alt="Logo" className="navbar-logo" />
        </Link>
      </div>

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

            {/* 👇 DROPDOWN MENU (Đã sửa lỗi lồng thẻ li) */}
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
                    {/* Link cho Guest tra cứu */}
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
                  <>
                    <li>
                      <Link
                        to="/myprofile"
                        onClick={() => setOpenDropdown(false)}
                      >
                        <FiUser /> Thông tin cá nhân
                      </Link>
                    </li>
                    <li
                      onClick={() => {
                        navigate("/track-order");
                        setOpenDropdown(false);
                      }}
                    >
                      <FiBox /> Đơn hàng của tôi
                    </li>
                    <hr />
                    <li onClick={logout}>
                      <FiLogOut /> Đăng xuất
                    </li>
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
