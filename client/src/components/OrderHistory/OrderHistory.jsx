import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import './OrderHistory.css';

const OrderHistory = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (token) {
        try {
          const response = await axios.get(`${url}/api/order/my-orders`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setOrders(response.data.orders);
          }
        } catch (error) {
          console.error('Lỗi khi tải lịch sử đơn hàng:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, url]);

  if (loading) {
    return <div className="order-history-container">Đang tải lịch sử đơn hàng...</div>;
  }

  return (
    <div className="order-history-container">
      <h2>Lịch sử đặt hàng</h2>
      <div className="order-history-list">
        {orders.length === 0 ? (
          <p>Bạn chưa có đơn hàng nào.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-history-item">
              <img src={assets.parcel_icon} alt="parcel icon" />
              <p className="order-items">
                {order.items.map((item, index) => (
                  <span key={index}>
                    {item.name} x {item.quantity}
                    {index < order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
              <p className="order-amount">{order.amount.toLocaleString()}đ</p>
              <p className="order-status">
                <span className={`status-dot status-${order.status}`}></span>
                <b>{order.status}</b>
              </p>
              <button onClick={() => navigate(`/success/${order._id}`)}>
                Xem chi tiết
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
