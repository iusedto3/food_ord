import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import "./OrderHistory.css";

const OrderHistory = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      if (token) {
        setLoading(true);
        try {
          const response = await axios.post(
            `${url}/api/order/userorders`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Lưu ý: Endpoint của bạn có thể là /userorders (POST) hoặc /my-orders (GET) tùy route bạn khai báo.
          // Ở đây mình dùng logic fetch chuẩn dựa trên code controller cũ.

          if (response.data.success) {
            setOrders(response.data.orders); // Controller đã sort reverse rồi
          }
        } catch (error) {
          console.error("Lỗi khi tải lịch sử đơn hàng:", error);
        } finally {
          setLoading(false);
        }
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
          <div className="empty-order">
            <p>Bạn chưa có đơn hàng nào.</p>
            <button onClick={() => navigate("/")}>Đặt món ngay</button>
          </div>
        ) : (
          currentOrders.map((order) => {
            // 🟢 1. TÍNH TOÁN GIÁ TIỀN THỰC TẾ (QUAN TRỌNG)
            const subtotal = order.amount || 0;
            const shipping = order.shippingFee || 20000; // Mặc định 20k nếu DB cũ chưa có
            const discount = order.discountAmount || 0;

            // Công thức: Tạm tính + Ship - Voucher
            const finalTotal = Math.max(0, subtotal + shipping - discount);

            return (
              <div key={order._id} className="order-history-item">
                <img src={assets.parcel_icon} alt="parcel icon" />

                <div className="order-info-group">
                  <p className="order-id">
                    Mã đơn: <span>#{order.orderId || order._id}</span>
                  </p>
                  <p className="order-item-count">
                    Số lượng: {order.items.length} món
                  </p>
                </div>

                {/* 🟢 2. HIỂN THỊ GIÁ FINAL TOTAL */}
                <div className="order-price-group">
                  <p className="order-amount">{finalTotal.toLocaleString()}đ</p>
                  {/* (Optional) Nếu muốn hiện chi tiết giảm giá thì mở dòng dưới */}
                  {/* {discount > 0 && <small style={{color:'green', fontSize:'12px'}}>Dis: -{discount.toLocaleString()}</small>} */}
                </div>

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
                  Theo dõi
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Thanh Phân Trang */}
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
