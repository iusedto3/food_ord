// src/utils/format.js

/**
 * 🪙 Định dạng số thành tiền Việt Nam (VD: 25,000 ₫)
 * @param {number} value - Số tiền
 * @returns {string} - Chuỗi đã định dạng
 */
export const formatVND = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0 ₫";
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
};

/**
 * 🔢 Định dạng số có dấu phẩy (VD: 1234567 -> "1,234,567")
 * @param {number} value - Số cần định dạng
 * @returns {string}
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return value.toLocaleString("vi-VN");
};

/**
 * 📅 Định dạng ngày thành dạng "dd/mm/yyyy" hoặc "dd/mm/yyyy hh:mm"
 * @param {string|Date|number} date - Chuỗi ngày, timestamp hoặc đối tượng Date
 * @param {boolean} includeTime - Có hiển thị giờ phút không
 * @returns {string}
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  };

  return d.toLocaleString("vi-VN", options);
};
