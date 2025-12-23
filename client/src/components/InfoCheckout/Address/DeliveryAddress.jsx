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

  // 1. LOGIC TỰ ĐỘNG CHỌN (AUTO-SELECT)
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

  // --- HANDLERS CƠ BẢN ---
  const handleChange = (field, value) => {
    setAddressData((prev) => ({ ...prev, [field]: value, selectedId: null }));
  };

  const handleSelectSavedAddress = (addr) => {
    setAddressData((prev) => ({
      ...prev,
      selectedId: addr.id,
      street: addr.street,
      city: addr.city, // Đảm bảo load cả Tên
      cityCode: addr.cityCode, // Load cả Code
      district: addr.district,
      districtCode: addr.districtCode,
      ward: addr.ward,
      wardCode: addr.wardCode,
      note: addr.note || "",
    }));
  };

  const handleAddNew = () => {
    setAddressData((prev) => ({
      ...prev,
      selectedId: null,
      street: "",
      city: "",
      cityCode: "",
      district: "",
      districtCode: "",
      ward: "",
      wardCode: "",
      note: "",
    }));
  };

  // -----------------------------------------------------------
  // 🔥 [QUAN TRỌNG] CÁC HÀM XỬ LÝ CHỌN ĐỊA CHỈ ĐÃ ĐƯỢC FIX 🔥
  // -----------------------------------------------------------

  const handleCityChange = (e) => {
    const code = Number(e.target.value);
    const selectedCity = cities.find((c) => c.code === code);

    setAddressData((prev) => ({
      ...prev,
      selectedId: null,
      cityCode: code,
      city: selectedCity ? selectedCity.name : "", // LƯU TÊN TỈNH VÀO ĐÂY

      // Reset cấp dưới
      districtCode: "",
      district: "",
      wardCode: "",
      ward: "",
    }));
  };

  const handleDistrictChange = (e) => {
    const code = Number(e.target.value);
    const selectedDistrict = districts.find((d) => d.code === code);

    setAddressData((prev) => ({
      ...prev,
      selectedId: null,
      districtCode: code,
      district: selectedDistrict ? selectedDistrict.name : "", // LƯU TÊN HUYỆN

      // Reset cấp dưới
      wardCode: "",
      ward: "",
    }));
  };

  const handleWardChange = (e) => {
    const code = Number(e.target.value);
    const selectedWard = wards.find((w) => w.code === code);

    setAddressData((prev) => ({
      ...prev,
      selectedId: null,
      wardCode: code,
      ward: selectedWard ? selectedWard.name : "", // LƯU TÊN XÃ
    }));
  };
  // -----------------------------------------------------------

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

      {/* --- DANH SÁCH ĐỊA CHỈ ĐÃ LƯU --- */}
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

      {/* --- FORM NHẬP LIỆU --- */}
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
            onChange={handleCityChange} // <-- Đã đổi sang dùng hàm mới
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
            onChange={handleDistrictChange} // <-- Đã đổi sang dùng hàm mới
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
            onChange={handleWardChange} // <-- Đã đổi sang dùng hàm mới
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
