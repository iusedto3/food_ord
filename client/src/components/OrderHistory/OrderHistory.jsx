import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import {
  FiBox,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSearch,
} from "react-icons/fi";
import "./OrderHistory.css";

const OrderHistory = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]); // Dùng chung state orders cho cả User và Guest
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");

  // --- STATE CHO GUEST ---
  const [keyword, setKeyword] = useState(""); // 1 input duy nhất
  const [isSearched, setIsSearched] = useState(false); // Để kiểm soát hiển thị kết quả

  // --- 1. LOGIC CHO USER (ĐÃ LOGIN) ---
  useEffect(() => {
    const fetchOrders = async () => {
      if (token) {
        setLoading(true);
        try {
          const response = await axios.get(`${url}/api/order/my-orders`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setOrders(response.data.orders.reverse());
          }
        } catch (error) {
          console.error("Lỗi tải đơn hàng:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrders();
  }, [token, url]);

  // --- 2. LOGIC CHO GUEST (TRA CỨU MỚI) ---
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      alert("Vui lòng nhập Mã đơn hàng!");
      return;
    }

    setLoading(true);
    setOrders([]); // Reset
    setIsSearched(true);

    try {
      // Gửi keyword là mã đơn hàng
      const res = await axios.post(`${url}/api/order/track`, {
        keyword: searchId.trim(),
      });

      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  // Helper UI
  const getStatusUI = (status) => {
    switch (status) {
      case "preparing":
        return (
          <span className="status-tag preparing">
            <FiClock /> Đang chuẩn bị
          </span>
        );
      case "delivering":
        return (
          <span className="status-tag delivering">
            <FiTruck /> Đang giao hàng
          </span>
        );
      case "completed":
        return (
          <span className="status-tag completed">
            <FiCheckCircle /> Hoàn thành
          </span>
        );
      case "canceled":
        return (
          <span className="status-tag canceled">
            <FiXCircle /> Đã hủy
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // ================== GIAO DIỆN GUEST (CHƯA LOGIN) ==================
  if (!token) {
    return (
      <div className="order-history-container guest-mode">
        <div className="guest-header">
          <h2>Tra cứu đơn hàng</h2>
          <p>
            Nhập <b>Mã đơn hàng</b> để kiểm tra tình trạng.
          </p>
        </div>

        <form className="track-form-single" onSubmit={handleTrackOrder}>
          <input
            type="text"
            placeholder="Nhập mã đơn hàng (VD: PH2411...)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? (
              "Đang tìm..."
            ) : (
              <>
                <FiSearch /> Tra cứu
              </>
            )}
          </button>
        </form>

        {/* Kết quả tìm kiếm */}
        {isSearched && (
          <div className="guest-results">
            {orders.length > 0 ? (
              <>
                <h3>Tìm thấy {orders.length} đơn hàng:</h3>
                <div className="order-history-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-history-item">
                      <div className="item-icon">
                        <FiBox size={24} color="#555" />
                      </div>
                      <div className="order-info-group">
                        <p className="order-id">
                          Mã: <span>#{order.orderId}</span>
                        </p>
                        <p className="order-item-count">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}{" "}
                          - {order.items.length} món
                        </p>
                      </div>
                      <p className="order-amount">
                        {order.amount.toLocaleString()}đ
                      </p>
                      <div className="order-status-col">
                        {getStatusUI(order.status)}
                      </div>
                      <button onClick={() => navigate(`/success/${order._id}`)}>
                        Chi tiết
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-result">
                <img
                  src={assets.parcel_icon}
                  alt="Empty"
                  style={{ opacity: 0.5, width: 50 }}
                />
                <p>Không tìm thấy đơn hàng nào phù hợp.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ================== GIAO DIỆN USER (ĐÃ LOGIN) - GIỮ NGUYÊN ==================
  if (loading)
    return <div className="order-history-container loading">Đang tải...</div>;

  return (
    <div className="order-history-container">
      <h2>Lịch sử đặt hàng</h2>
      <div className="order-history-list">
        {orders.length === 0 ? (
          <div className="empty-order">
            <p>Bạn chưa có đơn hàng nào.</p>
            <button onClick={() => navigate("/")}>Đặt món ngay</button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-history-item">
              <div className="item-icon">
                <FiBox size={30} color="#555" />
              </div>
              <div className="order-info-group">
                <p className="order-id">
                  Đơn hàng <span>#{order.orderId}</span>
                </p>
                <p className="order-item-count">{order.items.length} món ăn</p>
              </div>
              <p className="order-amount">{order.amount.toLocaleString()}đ</p>
              <div className="order-status-col">
                {getStatusUI(order.status)}
              </div>
              <button onClick={() => navigate(`/success/${order._id}`)}>
                Theo dõi
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
