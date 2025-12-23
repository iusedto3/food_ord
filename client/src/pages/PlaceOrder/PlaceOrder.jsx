import React, { useState, useContext, useEffect } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import useOrder from "../../hooks/useOrder";
import axios from "axios";

// Components
import InfoPayment from "../../components/InfoCheckout/InfoPayment";
import CartVoucher from "../../components/Voucher/CartVoucher";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import { FiArrowLeft } from "react-icons/fi";
import "./PlaceOrder.css";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { voucher, token, url, clearCart, cartItems } =
    useContext(StoreContext);
  const { placeOrder, loading } = useOrder();

  // --- STATE ---
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    district: "",
    ward: "",
    selectedId: null, // Chỉ cần gửi cái này nếu chọn từ sổ địa chỉ
    note: "",
  });

  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Sổ địa chỉ
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);

  // 1. LOAD ĐỊA CHỈ KHI VÀO TRANG
  useEffect(() => {
    if (token) {
      axios
        .post(
          `${url}/api/user/addresses`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => {
          if (res.data.success) {
            setSavedAddresses(res.data.list || []);
            // Tự động chọn địa chỉ mặc định
            const defaultAddr = res.data.list.find((a) => a.isDefault);
            if (defaultAddr) {
              setAddressData({
                ...defaultAddr,
                selectedId: defaultAddr.id,
              });
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
    // 1. Validate Form
    if (!customerData.name || !customerData.phone) {
      alert("Vui lòng nhập tên và số điện thoại người nhận!");
      return;
    }

    // --- [ĐÃ SỬA] Thay biến 'data' thành 'addressData' để debug ---
    console.log("🔍 DEBUG - Dữ liệu địa chỉ hiện tại:", addressData);

    // Nếu KHÔNG chọn địa chỉ có sẵn, bắt buộc phải nhập tay đủ 3 cấp
    if (!addressData.selectedId) {
      // Kiểm tra kỹ từng trường xem cái nào bị thiếu
      if (!addressData.street || !addressData.city || !addressData.district) {
        // Log chi tiết lỗi ra console để bạn biết thiếu cái nào
        console.error("❌ Thiếu thông tin địa chỉ:", {
          street: addressData.street,
          city: addressData.city,
          district: addressData.district,
        });
        alert("Vui lòng nhập đầy đủ địa chỉ giao hàng (Tỉnh, Quận, Phường)!");
        return;
      }
    }

    // 2. Lưu địa chỉ mới (Nếu user tick chọn)
    // Logic này giữ ở FE là hợp lý vì nó là hành động "Thêm vào sổ địa chỉ"
    if (token && saveAddress && !addressData.selectedId) {
      try {
        const newAddr = {
          label: "Địa chỉ mới",
          name: customerData.name,
          phone: customerData.phone,
          street: addressData.street,
          city: addressData.city,
          district: addressData.district,
          ward: addressData.ward,
        };
        await axios.post(
          `${url}/api/user/add-address`,
          { address: newAddr },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.error("Lỗi lưu địa chỉ", e);
      }
    }

    // 3. Gọi API tạo đơn (GỬI DỮ LIỆU THÔ)
    // Backend sẽ tự lo việc tìm địa chỉ chi tiết dựa trên selectedId
    // Backend sẽ tự lo việc fix lỗi object crust trong items
    const response = await placeOrder({
      addressData: addressData,
      customerData: customerData,
      paymentMethod: paymentMethod,
      voucher: voucher,
      items: cartItems, // Gửi nguyên cartItems, không cần map sửa lỗi
    });

    // 4. Xử lý kết quả
    if (response && response.success) {
      clearCart();
      const { orderId, paymentUrl } = response;

      if (
        paymentMethod === "momo" ||
        paymentMethod === "zalopay" ||
        paymentMethod === "stripe"
      ) {
        // Xử lý chuyển trang thanh toán
        if (paymentUrl) window.location.replace(paymentUrl);
        else alert("Lỗi lấy link thanh toán");
      } else {
        navigate(`/verify?orderId=${orderId}&status=success`);
      }
    } else {
      // Handle error msg if needed
      if (response?.msg) alert(response.msg);
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
          <InfoPayment
            addressData={addressData}
            setAddressData={setAddressData}
            customerData={customerData}
            setCustomerData={setCustomerData}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
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
