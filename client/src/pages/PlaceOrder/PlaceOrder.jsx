import React, { useState, useContext, useEffect } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import useOrder from "../../hooks/useOrder";
import axios from "axios"; // Import axios để gọi API lấy địa chỉ

// Components
import InfoPayment from "../../components/InfoCheckout/InfoPayment";
import CartVoucher from "../../components/Voucher/CartVoucher";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import { FiArrowLeft } from "react-icons/fi";
import "./PlaceOrder.css";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { voucher, token, url } = useContext(StoreContext); // Lấy token & url
  const { placeOrder, loading } = useOrder();

  // --- STATE ĐỊA CHỈ ---
  const [addressData, setAddressData] = useState({
    street: "",
    cityCode: "",
    districtCode: "",
    wardCode: "",
    city: "",
    district: "",
    ward: "", // Lưu tên
    selectedId: null, // ID của địa chỉ đã chọn (nếu có)
    note: "",
  });

  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // 🟢 STATE MỚI: SỔ ĐỊA CHỈ & CHECKBOX LƯU
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);

  // 1. LOAD ĐỊA CHỈ KHI VÀO TRANG (Chỉ User)
  useEffect(() => {
    if (token) {
      axios
        .post(`${url}/api/user/addresses`, {}, { headers: { token } })
        .then((res) => {
          if (res.data.success) {
            setSavedAddresses(res.data.list);
            // Tự động chọn địa chỉ mặc định (nếu có)
            const defaultAddr = res.data.list.find((a) => a.isDefault);
            if (defaultAddr) {
              // Fill dữ liệu vào form
              setAddressData({
                ...defaultAddr,
                selectedId: defaultAddr.id,
              });
              // Fill thông tin người nhận luôn
              setCustomerData((prev) => ({
                ...prev,
                name: defaultAddr.name || prev.name,
                phone: defaultAddr.phone || prev.phone,
              }));
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [token, url]);

  // --- XỬ LÝ ĐẶT HÀNG ---
  const handlePlaceOrder = async () => {
    // 1. Validate
    if (!addressData.street || !customerData.name || !customerData.phone) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    // 🟢 2. LƯU ĐỊA CHỈ MỚI (Nếu user tick chọn và đang nhập mới)
    if (token && saveAddress && !addressData.selectedId) {
      try {
        const newAddr = {
          label: "Địa chỉ mới",
          name: customerData.name,
          phone: customerData.phone,
          street: addressData.street,
          city: addressData.city,
          cityCode: addressData.cityCode,
          district: addressData.district,
          districtCode: addressData.districtCode,
          ward: addressData.ward,
          wardCode: addressData.wardCode,
        };
        // Gọi API lưu ngầm
        await axios.post(
          `${url}/api/user/add-address`,
          { address: newAddr },
          { headers: { token } }
        );
      } catch (e) {
        console.error("Lỗi lưu địa chỉ", e);
      }
    }

    // 3. Gọi API tạo đơn
    const response = await placeOrder({
      addressData,
      customerData,
      paymentMethod,
      voucher,
    });

    // ... (Phần xử lý redirect giữ nguyên) ...
    if (response && response.success) {
      // ... code cũ ...
      const { orderId, paymentUrl } = response;
      if (paymentMethod === "momo") {
        /*...*/
      } else if (paymentUrl) {
        window.location.replace(paymentUrl);
      } else {
        navigate(`/verify?orderId=${orderId}&status=success`);
      }
    }
  };

  return (
    <div className="placeorder-page">
      <div className="placeorder-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Trở lại
        </button>
        <h2 className="page-title">Thanh toán</h2>
        <div style={{ width: "80px" }}></div>
      </div>

      <div className="placeorder-layout">
        <div className="layout-left">
          {/* Truyền thêm props xuống InfoPayment */}
          <InfoPayment
            addressData={addressData}
            setAddressData={setAddressData}
            customerData={customerData}
            setCustomerData={setCustomerData}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            // Props mới cho Sổ địa chỉ
            savedAddresses={savedAddresses}
            saveAddress={saveAddress}
            setSaveAddress={setSaveAddress}
            isLoggedIn={!!token}
          />
        </div>

        <div className="layout-right">
          <CartVoucher />
          <OrderSummary onPlaceOrder={handlePlaceOrder} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
