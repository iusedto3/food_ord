export const validatePromotion = (data) => {
  const { type, value, startDate, endDate, minOrderAmount, code } = data;

  if (!["percentage", "fixed", "coupon"].includes(type))
    return "type must be 'percentage', 'fixed' hoặc 'coupon'";

  if (typeof value !== "number" || value <= 0)
    return "value phải là số và > 0";

  if (type === "percentage" && value > 100)
    return "value % không được lớn hơn 100";

  if (!startDate || !endDate) return "startDate và endDate là bắt buộc";

  if (new Date(startDate) >= new Date(endDate))
    return "startDate phải nhỏ hơn endDate";

  if (minOrderAmount < 0)
    return "minOrderAmount phải >= 0";

  if (code && typeof code !== "string")
    return "code phải là string";

  return null;
};
