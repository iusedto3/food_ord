import React, { useEffect, useState, useContext } from "react";
import { StoreContext } from "../../../contexts/StoreContext";

const CustomerInfo = ({ customerData, setCustomerData }) => {
  const { url } = useContext(StoreContext); // Get url from StoreContext
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  // User data từ backend (nếu login)
  const [userInfo, setUserInfo] = useState(null);

  // ───────────────────────────────
  // Lấy thông tin user khi đăng nhập
  // ───────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${url}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          setUserInfo(data.user);

          // đẩy info vào customerData để order dùng
          setCustomerData({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
          });
        }
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchUser();
  }, [isLoggedIn, token, url]); // Add url to dependency array

  return (
    <div className="checkout-section">
      <h3 className="section-title">Người đặt hàng</h3>

      {/* USER: auto-fill + không cho sửa */}
      {isLoggedIn && userInfo && (
        <div className="user-info-box">
          <p>
            <strong>Họ tên:</strong> {userInfo.name}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {userInfo.phone || "Chưa có"}
          </p>
          <p>
            <strong>Email:</strong> {userInfo.email}
          </p>
        </div>
      )}

      {/* GUEST: hiện form nhập */}
      {!isLoggedIn && (
        <div className="section-box">
          <input
            type="text"
            placeholder="Họ và tên *"
            value={customerData.name}
            onChange={(e) =>
              setCustomerData({ ...customerData, name: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Số điện thoại *"
            value={customerData.phone}
            onChange={(e) =>
              setCustomerData({ ...customerData, phone: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email *"
            value={customerData.email}
            onChange={(e) =>
              setCustomerData({ ...customerData, email: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
};

export default CustomerInfo;
