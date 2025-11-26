import React, { useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiPackage } from "react-icons/fi";
import "./TrackOrder.css";

const TrackOrder = () => {
  const { url } = useContext(StoreContext);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("Vui lòng nhập mã đơn hàng");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Gọi API lấy chi tiết đơn hàng (API này Guest cũng gọi được)
      const response = await axios.get(`${url}/api/order/detail/${orderId}`);

      if (response.data.success && response.data.order) {
        // Tìm thấy -> Chuyển hướng sang trang chi tiết (OrderSuccess)
        // Chúng ta tái sử dụng trang Success vì nó đã có giao diện hiển thị chi tiết đơn
        navigate(`/success/${response.data.order._id}`);
      } else {
        setError("Không tìm thấy đơn hàng với mã này.");
      }
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra hoặc mã đơn không tồn tại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-order-container">
      <div className="track-box">
        <div className="track-header">
          <FiPackage className="track-icon" />
          <h2>Tra cứu đơn hàng</h2>
          <p>Nhập mã đơn hàng của bạn để kiểm tra trạng thái</p>
        </div>

        <form onSubmit={handleSearch} className="track-form">
          <div className="input-group">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Ví dụ: PH2511..."
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value.toUpperCase()); // Tự động viết hoa
                setError("");
              }}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Đang tìm kiếm..." : "Tra cứu ngay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrackOrder;
