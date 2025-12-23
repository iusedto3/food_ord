import React from "react";

// 1. Đưa các hàm xử lý ra ngoài hoặc để trên cùng để dễ quản lý
const formatAddress = (addr) => {
  if (!addr) return "Địa chỉ không xác định";

  // Lấy dữ liệu linh hoạt (đề phòng backend trả về tên khác nhau)
  const street = addr.street || addr.details || ""; // Thử cả 'details' nếu 'street' rỗng
  const ward = addr.ward || addr.wardName || "";
  const district = addr.district || addr.districtName || "";
  const city = addr.city || addr.cityName || "";

  // filter(Boolean) sẽ loại bỏ các giá trị rỗng/null, giúp không bị dư dấu phẩy
  const addressParts = [street, ward, district, city].filter(Boolean);

  if (addressParts.length === 0) return "Chưa có thông tin địa chỉ";

  return addressParts.join(", ");
};

const SuccessDelivery = ({ order }) => {
  // 2. Kiểm tra an toàn: Nếu chưa có order thì không render gì cả (tránh lỗi crash)
  if (!order || !order.address) {
    return <div className="card p-4">Đang tải thông tin...</div>;
  }

  return (
    <div className="card">
      <h3 className="success-card-title">Giao đến</h3>

      {/* Hiển thị thông tin người nhận */}
      <div className="success-card-info">
        <p className="success-card-text font-bold">
          {order.customer?.name || order.user?.name || "Khách hàng"}
        </p>
        <p className="success-card-text">
          {order.customer?.phone || order.address?.phone || ""}
        </p>

        {/* 3. Gọi hàm formatAddress đã viết ở trên */}
        <p className="success-card-text mt-1">{formatAddress(order.address)}</p>
      </div>
    </div>
  );
};

export default SuccessDelivery;
