import React, { useState, useEffect } from "react";
import "./DeliveryAddress.css";

const DeliveryAddress = ({
  addressData,
  setAddressData,
  savedAddresses,
  setSavedAddresses,
  saveAddress,
  setSaveAddress,
  isLoggedIn,
}) => {
  const [errors, setErrors] = useState({});

  // Data from API
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Load cities on component mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch((err) => console.log(err));
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (!addressData.cityCode) return;
    fetch(`https://provinces.open-api.vn/api/p/${addressData.cityCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts))
      .catch((err) => console.log(err));
  }, [addressData.cityCode]);

  // Load wards when district changes
  useEffect(() => {
    if (!addressData.districtCode) return;
    fetch(`https://provinces.open-api.vn/api/d/${addressData.districtCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => setWards(data.wards))
      .catch((err) => console.log(err));
  }, [addressData.districtCode]);

  const selectSavedAddress = (item) => {
    setAddressData({
      selectedId: item.id,
      street: item.street,
      cityCode: cities.find((c) => c.name === item.city)?.code,
      districtCode: districts.find((d) => d.name === item.district)?.code,
      wardCode: wards.find((w) => w.name === item.ward)?.code,
    });
  };

  return (
    <div className="checkout-section">
      <h3 className="section-title">Giao đến</h3>

      {isLoggedIn && savedAddresses.length > 0 && (
        <div className="address-list">
          {savedAddresses.map((item) => (
            <div
              key={item.id}
              className={`address-item ${
                addressData.selectedId === item.id ? "active" : ""
              }`}
              onClick={() => selectSavedAddress(item)}
            >
              <div className="label-line">
                <span className="label">{item.label}</span>
              </div>
              <p className="address-text">{item.fullAddress}</p>
            </div>
          ))}
        </div>
      )}

      <div className="section-box">
        <input
          type="text"
          placeholder="Số nhà, tên đường *"
          value={addressData.street}
          onChange={(e) =>
            setAddressData({ ...addressData, street: e.target.value })
          }
        />
        {errors.street && <p className="error">{errors.street}</p>}

        <select
          value={addressData.cityCode || ""}
          onChange={(e) =>
            setAddressData({
              ...addressData,
              cityCode: Number(e.target.value),
              districtCode: "",
              wardCode: "",
            })
          }
        >
          <option value="">Chọn Tỉnh/Thành *</option>
          {cities.map((city) => (
            <option key={city.code} value={city.code}>
              {city.name}
            </option>
          ))}
        </select>

        <select
          value={addressData.districtCode || ""}
          disabled={!addressData.cityCode}
          onChange={(e) =>
            setAddressData({
              ...addressData,
              districtCode: Number(e.target.value),
              wardCode: "",
            })
          }
        >
          <option value="">Chọn Quận/Huyện *</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={addressData.wardCode || ""}
          disabled={!addressData.districtCode}
          onChange={(e) =>
            setAddressData({
              ...addressData,
              wardCode: Number(e.target.value),
            })
          }
        >
          <option value="">Chọn Phường/Xã *</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>

        {isLoggedIn && (
          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
            />
            <label>Lưu địa chỉ này cho lần sau</label>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryAddress;
