import React, { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../../contexts/StoreContext";
import {
  FiMapPin,
  FiCheckCircle,
  FiPlus,
  FiHome,
  FiBriefcase,
} from "react-icons/fi";
import "./DeliveryAddress.css";

const DeliveryAddress = ({
  addressData,
  setAddressData,
  savedAddresses,
  setSavedAddresses,
  // 👇 CẬP NHẬT: Nhận thêm 3 props này từ InfoPayment
  saveAddress,
  setSaveAddress,
  isLoggedIn,
}) => {
  const { url } = useContext(StoreContext);

  // State API hành chính
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // UX State
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // ----------------------------------------------------
  // 1. LOGIC TỰ ĐỘNG CHỌN (AUTO-SELECT)
  // ----------------------------------------------------
  useEffect(() => {
    if (
      savedAddresses &&
      savedAddresses.length > 0 &&
      !addressData.selectedId
    ) {
      const defaultAddr =
        savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];
      handleSelectSavedAddress(defaultAddr);
    }
  }, [savedAddresses]);

  // --- API CALLS ---
  useEffect(() => {
    setLoadingCities(true);
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        setLoadingCities(false);
      })
      .catch(() => setLoadingCities(false));
  }, []);

  useEffect(() => {
    if (!addressData.cityCode) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    fetch(`https://provinces.open-api.vn/api/p/${addressData.cityCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data.districts);
        setLoadingDistricts(false);
      })
      .catch(() => setLoadingDistricts(false));
  }, [addressData.cityCode]);

  useEffect(() => {
    if (!addressData.districtCode) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    fetch(
      `https://provinces.open-api.vn/api/d/${addressData.districtCode}?depth=2`
    )
      .then((res) => res.json())
      .then((data) => {
        setWards(data.wards);
        setLoadingWards(false);
      })
      .catch(() => setLoadingWards(false));
  }, [addressData.districtCode]);

  // --- HANDLERS ---
  const handleChange = (field, value) => {
    setAddressData((prev) => ({ ...prev, [field]: value, selectedId: null }));
  };

  const handleSelectSavedAddress = (addr) => {
    setAddressData((prev) => ({
      ...prev,
      selectedId: addr.id,
      street: addr.street,
      cityCode: addr.cityCode,
      districtCode: addr.districtCode,
      wardCode: addr.wardCode,
      note: addr.note || "",
    }));
  };

  const handleAddNew = () => {
    setAddressData((prev) => ({
      ...prev,
      selectedId: null,
      street: "",
      cityCode: "",
      districtCode: "",
      wardCode: "",
      note: "",
    }));
  };

  // HELPER: Lấy Icon theo nhãn
  const getLabelIcon = (label) => {
    const lower = label?.toLowerCase() || "";
    if (lower.includes("nhà")) return <FiHome />;
    if (lower.includes("ty") || lower.includes("văn phòng"))
      return <FiBriefcase />;
    return <FiMapPin />;
  };

  return (
    <div className="checkout-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 className="card-title" style={{ margin: 0 }}>
          Giao đến
        </h3>
      </div>

      {/* --- PHẦN 1: DANH SÁCH ĐỊA CHỈ ĐÃ LƯU --- */}
      {isLoggedIn && savedAddresses && savedAddresses.length > 0 && (
        <div className="saved-address-section">
          <div className="saved-address-grid">
            {savedAddresses.map((addr) => {
              const isSelected = addressData.selectedId === addr.id;
              return (
                <div
                  key={addr.id}
                  className={`address-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectSavedAddress(addr)}
                >
                  <div className="card-header-row">
                    <h4 className={isSelected ? "text-danger" : ""}>
                      {getLabelIcon(addr.label)} {addr.label}
                    </h4>
                    {isSelected && <FiCheckCircle className="check-icon" />}
                  </div>
                  <p title={addr.fullAddress}>{addr.fullAddress}</p>
                </div>
              );
            })}

            <div
              className={`address-card add-new-card ${
                !addressData.selectedId ? "selected" : ""
              }`}
              onClick={handleAddNew}
            >
              <FiPlus size={24} />
              <span>Địa chỉ khác</span>
            </div>
          </div>
        </div>
      )}

      {/* --- PHẦN 2: FORM HIỂN THỊ CHI TIẾT --- */}
      <div
        className={`address-form-grid ${
          addressData.selectedId ? "form-passive" : ""
        }`}
      >
        <div className="form-group full-width">
          <label>Địa chỉ cụ thể</label>
          <input
            type="text"
            placeholder="Số nhà, tên đường..."
            value={addressData.street}
            onChange={(e) => handleChange("street", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Tỉnh / Thành</label>
          <select
            value={addressData.cityCode || ""}
            onChange={(e) => {
              handleChange("cityCode", Number(e.target.value));
              handleChange("districtCode", "");
              handleChange("wardCode", "");
            }}
            disabled={loadingCities}
          >
            <option value="">
              {loadingCities ? "Đang tải..." : "Tỉnh/Thành"}
            </option>
            {cities.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quận / Huyện</label>
          <select
            value={addressData.districtCode || ""}
            disabled={!addressData.cityCode || loadingDistricts}
            onChange={(e) => {
              handleChange("districtCode", Number(e.target.value));
              handleChange("wardCode", "");
            }}
          >
            <option value="">
              {loadingDistricts ? "Đang tải..." : "Quận/Huyện"}
            </option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Phường / Xã</label>
          <select
            value={addressData.wardCode || ""}
            disabled={!addressData.districtCode || loadingWards}
            onChange={(e) => handleChange("wardCode", Number(e.target.value))}
          >
            <option value="">
              {loadingWards ? "Đang tải..." : "Phường/Xã"}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* <div className="form-group full-width">
          <label>Ghi chú</label>
          <input
            type="text"
            placeholder="Ví dụ: Cổng sau..."
            value={addressData.note || ""}
            onChange={(e) => handleChange("note", e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label>Thời gian nhận</label>
          <select
            value={addressData.deliveryTime || "now"}
            onChange={(e) => handleChange("deliveryTime", e.target.value)}
          >
            <option value="now">🚀 Giao ngay</option>
            <option value="later">📅 Hẹn giờ</option>
          </select>
        </div> */}

        {/* 👇👇👇 PHẦN CHECKBOX LƯU ĐỊA CHỈ (Đã thêm lại) 👇👇👇 */}
        {/* 👇 BỎ ĐIỀU KIỆN !addressData.selectedId ĐỂ LUÔN HIỆN 👇 */}
        {isLoggedIn && (
          <div className="form-group full-width">
            <label
              className="checkbox-label"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                style={{ width: "auto", margin: 0 }}
              />
              <span>Lưu địa chỉ này cho lần đặt sau</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryAddress;
