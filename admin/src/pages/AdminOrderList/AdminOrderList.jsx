import React, { useEffect, useState } from "react";
import OrderDetailModal from "../../components/Features/OrderDetailModal/OrderDetailModal";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import "../../components/StatusBadge/StatusBadge.css";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import {
  getProvinceName,
  getDistrictName,
  getWardName,
} from "../../utils/addressHelper";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./AdminOrderList.css";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  // State bộ lọc
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/order/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // . useEffect để lắng nghe Socket

  useEffect(() => {
    const socket = io("http://localhost:4000");

    // Listener 1: Đơn mới (Đã làm)
    socket.on("new_order", () => {
      fetchOrders();
    });

    // 🔥 Listener 2: Thanh toán thành công (Mới thêm)
    socket.on("payment_updated", (updatedInfo) => {
      // Cách 1: Gọi lại API (Đơn giản nhất, code ngắn)
      // fetchOrders();

      // Cách 2: Cập nhật State (Mượt hơn, không load lại cả bảng)
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedInfo.orderId
            ? { ...o, paymentStatus: "paid", payment: true }
            : o
        )
      );
      // Cập nhật luôn cả filteredOrders nếu đang lọc
      setFilteredOrders((prev) =>
        prev.map((o) =>
          o._id === updatedInfo.orderId
            ? { ...o, paymentStatus: "paid", payment: true }
            : o
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  // 2. Logic Lọc & Reset trang
  useEffect(() => {
    let result = orders;

    // Lọc theo Tab
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Lọc theo Tìm kiếm
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderId.toLowerCase().includes(lowerTerm) ||
          (o.customer?.phone && o.customer.phone.includes(lowerTerm))
      );
    }
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [orders, statusFilter, searchTerm]);

  // 3. Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Tabs
  const statusTabs = [
    { id: "all", label: "Tất cả" },
    { id: "preparing", label: "Chờ xử lý" },
    { id: "delivering", label: "Đang giao" },
    { id: "completed", label: "Hoàn thành" },
    { id: "canceled", label: "Đã hủy" },
  ];

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <h2>Quản lý Đơn hàng</h2>
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm mã đơn, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs Trạng thái */}
      <div className="status-tabs">
        {statusTabs.map((tab) => {
          const count =
            tab.id === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab.id).length;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${statusFilter === tab.id ? "active" : ""}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="table-responsive">
        <table className="order-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Địa chỉ giao hàng</th>
              <th>Ngày đặt</th>

              <th>PTTT</th>
              <th>Thanh toán</th>

              <th className="text-end">Tổng tiền</th>
              {/* ✅ MỞ LẠI CỘT GIẢM GIÁ */}
              <th className="text-end">Giảm giá</th>
              <th className="text-end">Thực thu</th>

              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((o) => {
                // Tính toán
                const subtotal = o.amount || 0;
                const shipping = o.shippingFee || 20000;
                const discount = o.discountAmount || 0;
                // Thực thu = Tổng tiền + Ship - Giảm giá
                const finalTotal = Math.max(0, subtotal + shipping - discount);

                return (
                  <tr key={o._id}>
                    <td className="fw-bold">#{o.orderId}</td>

                    <td>
                      <div className="customer-cell">
                        <span className="fw-bold">{o.customer?.name}</span>
                        <small className="text-muted">
                          {o.customer?.phone}
                        </small>
                      </div>
                    </td>

                    <td style={{ maxWidth: "200px" }}>
                      <div className="address-cell">
                        <span>{o.address?.street}</span>
                        <small
                          className="text-muted"
                          style={{ display: "block", lineHeight: "1.2" }}
                        >
                          {getWardName(o.address?.wardCode)},{" "}
                          {getDistrictName(o.address?.districtCode)}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div className="date-cell">
                        <span>
                          {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <small className="text-muted">
                          {new Date(o.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    </td>

                    {/* CỘT 1: Phương thức thanh toán */}
                    <td>
                      <span
                        className={`payment-badge ${
                          o.paymentMethod === "cod" ? "cod" : "online"
                        }`}
                      >
                        {o.paymentMethod === "cod"
                          ? "Tiền mặt"
                          : o.paymentMethod.toUpperCase()}
                      </span>
                    </td>

                    {/* CỘT 2: Trạng thái thanh toán */}
                    <td>
                      {o.paymentStatus === "paid" ? (
                        <span className="status-paid">Đã thanh toán</span>
                      ) : (
                        <span className="status-unpaid">Chưa thanh toán</span>
                      )}
                    </td>

                    {/* Tổng tiền hàng + Ship */}
                    <td className="text-end">
                      {(subtotal + shipping).toLocaleString()}đ
                    </td>

                    {/* ✅ CỘT GIẢM GIÁ (MỚI BỔ SUNG) */}
                    <td className="text-end">
                      {discount > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                          }}
                        >
                          <span style={{ color: "#c62828", fontWeight: "600" }}>
                            -{discount.toLocaleString()}đ
                          </span>
                          {o.voucherCode && (
                            <small
                              style={{
                                fontSize: "10px",
                                color: "#666",
                                background: "#f5f5f5",
                                padding: "1px 4px",
                                borderRadius: "3px",
                              }}
                            >
                              {o.voucherCode}
                            </small>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#ccc" }}>-</span>
                      )}
                    </td>

                    {/* Thực thu */}
                    <td className="text-end">
                      <span
                        style={{
                          color: "#2e7d32",
                          fontWeight: "700",
                          fontSize: "15px",
                        }}
                      >
                        {finalTotal.toLocaleString()}đ
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={o.status} />
                    </td>

                    <td>
                      <button
                        className="btn-view"
                        onClick={() => setSelectedOrder(o)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                {/* Tăng colSpan lên 12 vì bảng hiện tại khá nhiều cột */}
                <td colSpan="12" className="empty-row">
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {filteredOrders.length > itemsPerPage && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="page-btn"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FiChevronRight />
          </button>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          refreshList={fetchOrders}
        />
      )}
    </div>
  );
};

export default AdminOrderList;
