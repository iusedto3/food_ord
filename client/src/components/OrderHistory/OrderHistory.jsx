import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import "./OrderHistory.css";

const OrderHistory = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số đơn hàng mỗi trang

  useEffect(() => {
    const fetchOrders = async () => {
      if (token) {
        try {
          const response = await axios.get(`${url}/api/order/my-orders`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            // Đảo ngược mảng để đơn mới nhất lên đầu
            setOrders(response.data.orders.reverse());
          }
        } catch (error) {
          console.error("Lỗi khi tải lịch sử đơn hàng:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, url]);

  // --- LOGIC PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="order-history-container">
        Đang tải lịch sử đơn hàng...
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h2>Lịch sử đặt hàng</h2>
      <div className="order-history-list">
        {orders.length === 0 ? (
          <p>Bạn chưa có đơn hàng nào.</p>
        ) : (
          currentOrders.map((order) => (
            <div key={order._id} className="order-history-item">
              <img src={assets.parcel_icon} alt="parcel icon" />

              {/* 👇 CẬP NHẬT: Hiện Mã đơn hàng thay vì list món */}
              <div className="order-info-group">
                <p className="order-id">
                  Mã đơn: <span>#{order.orderId || order._id}</span>
                </p>
                <p className="order-item-count">
                  Số lượng: {order.items.length} món
                </p>
              </div>

              <p className="order-amount">{order.amount.toLocaleString()}đ</p>

              <p className="order-status">
                <span className={`status-dot status-${order.status}`}></span>
                <b>
                  {order.status === "preparing"
                    ? "Đang chuẩn bị"
                    : order.status === "delivering"
                    ? "Đang giao"
                    : order.status === "completed"
                    ? "Hoàn thành"
                    : "Đã hủy"}
                </b>
              </p>

              <button onClick={() => navigate(`/success/${order._id}`)}>
                Xem chi tiết
              </button>
            </div>
          ))
        )}
      </div>

      {/* 👇 CẬP NHẬT: Thanh Phân Trang */}
      {orders.length > itemsPerPage && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
