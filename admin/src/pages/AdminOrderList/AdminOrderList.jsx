import React, { useEffect, useState } from "react";
import OrderDetailModal from "../../components/Features/OrderDetailModal/OrderDetailModal";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import "../../components/StatusBadge/StatusBadge.css";
import {
  getProvinceName,
  getDistrictName,
  getWardName,
} from "../../utils/addressHelper";

import "./AdminOrderList.css"; // file css riêng nếu bạn có

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch orders
  const fetchOrders = async () => {
    const res = await fetch("http://localhost:4000/api/order/admin/orders");
    const data = await res.json();
    if (data.success) setOrders(data.orders);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered list based on payment method
  const filteredOrders = orders.filter((order) =>
    filter === "all" ? true : order.paymentMethod === filter
  );

  return (
    <div className="admin-orders">
      <div className="header-row">
        <h2>Danh sách đơn hàng</h2>

        {/* Filter */}
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="cod">COD</option>
          <option value="momo">Momo</option>
          <option value="vnpay">VNPAY</option>
        </select>
      </div>

      {/* Table */}
      <table className="order-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách</th>
            <th>SĐT</th>
            <th>Tổng</th>
            <th>Thanh toán</th>
            <th>Địa chỉ</th>
            <th>Trạng thái</th>
            <th>Ngày</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o._id}>
              <td>{o.orderId}</td>
              <td>{o.customer?.name}</td>
              <td>{o.customer?.phone}</td>
              <td>{o.amount.toLocaleString()}đ</td>

              <td>{o.paymentMethod.toUpperCase()}</td>

              {/* ✔ Địa chỉ */}
              <td>
                {o.address
                  ? `${o.address.street}, ${getWardName(
                      o.address.wardCode
                    )}, ${getDistrictName(
                      o.address.districtCode
                    )}, ${getProvinceName(o.address.cityCode)}`
                  : "Không có"}
              </td>

              <td>
                <StatusBadge status={o.status} />
              </td>

              <td>{new Date(o.createdAt).toLocaleString()}</td>

              <td>
                <button
                  className="detail-btn"
                  onClick={() => setSelectedOrder(o)}
                >
                  !
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
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
