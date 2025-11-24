import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../contexts/StoreContext';
import './ProfileInfo.css';
import ChangePasswordForm from '../ChangePasswordForm/ChangePasswordForm';

const ProfileInfo = () => {
  const { url, token } = useContext(StoreContext);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);


  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${url}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setUserInfo(response.data.user);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Lỗi khi tải thông tin người dùng.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [token, url]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');
      const response = await axios.put(
        `${url}/api/user/update-profile`,
        { name: userInfo.name, phone: userInfo.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMessage('Cập nhật thông tin thành công!');
        setEditMode(false);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Lỗi khi cập nhật thông tin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setShowChangePasswordForm(true);
  };

  if (loading) {
    return <div className="profile-info-container">Đang tải thông tin...</div>;
  }

  if (error) {
    return <div className="profile-info-container error-message">{error}</div>;
  }

  return (
    <div className="profile-info-container">
      {showChangePasswordForm && (
        <ChangePasswordForm onClose={() => setShowChangePasswordForm(false)} />
      )}
      <h2>Thông tin cá nhân</h2>
      <div className="profile-card">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="profile-info-item">
          <label>Email:</label>
          <span>{userInfo.email}</span>
        </div>

        <div className="profile-info-item">
          <label htmlFor="name">Họ tên:</label>
          {editMode ? (
            <input
              type="text"
              id="name"
              name="name"
              value={userInfo.name}
              onChange={handleInputChange}
            />
          ) : (
            <span>{userInfo.name}</span>
          )}
        </div>

        <div className="profile-info-item">
          <label htmlFor="phone">Số điện thoại:</label>
          {editMode ? (
            <input
              type="text"
              id="phone"
              name="phone"
              value={userInfo.phone}
              onChange={handleInputChange}
            />
          ) : (
            <span>{userInfo.phone || 'Chưa có'}</span>
          )}
        </div>

        <div className="profile-actions">
          {editMode ? (
            <button className="profile-btn save-btn" onClick={handleSaveChanges}>
              Lưu thay đổi
            </button>
          ) : (
            <button className="profile-btn edit-btn" onClick={() => setEditMode(true)}>
              Chỉnh sửa
            </button>
          )}
          <button
            className="profile-btn change-password-btn"
            onClick={handleChangePassword}
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
