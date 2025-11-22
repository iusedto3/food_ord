import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";

// GET: lấy danh sách địa chỉ của user
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    return res.json({
      success: true,
      addresses: user.addressList || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST: thêm địa chỉ mới
export const addAddress = async (req, res) => {
  try {
    const { street, ward, district, city, label } = req.body;

    const newAddress = {
      id: uuidv4(),
      label: label || "Địa chỉ mới",
      street,
      ward,
      district,
      city,
      isDefault: false
    };

    const user = await User.findById(req.body.userId);
    user.addressList.push(newAddress);
    await user.save();

    res.json({ success: true, address: newAddress });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT: cập nhật 1 địa chỉ
export const updateAddress = async (req, res) => {
  try {
    const addrId = req.params.id;
    const { street, ward, district, city, label } = req.body;

    const user = await User.findById(req.body.userId);
    const addr = user.addressList.find((a) => a.id === addrId);

    if (!addr)
      return res.status(404).json({ success: false, message: "Địa chỉ không tồn tại" });

    addr.label = label || addr.label;
    addr.street = street;
    addr.ward = ward;
    addr.district = district;
    addr.city = city;

    await user.save();

    res.json({ success: true, address: addr });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE địa chỉ
export const deleteAddress = async (req, res) => {
  try {
    const addrId = req.params.id;
    const user = await User.findById(req.body.userId);

    user.addressList = user.addressList.filter((a) => a.id !== addrId);

    await user.save();

    res.json({ success: true, message: "Đã xoá địa chỉ" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
