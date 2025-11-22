import React from 'react';
import { NavLink } from 'react-router-dom';
import './ProfileSidebar.css';

const ProfileSidebar = () => {
  return (
    <div className="profile-sidebar">
      <ul>
        <li>
          <NavLink to="/myprofile/info" className={({ isActive }) => isActive ? 'active' : ''}>
            Thông tin cá nhân
          </NavLink>
        </li>
        <li>
          <NavLink to="/myprofile/orders" className={({ isActive }) => isActive ? 'active' : ''}>
            Lịch sử đặt hàng
          </NavLink>
        </li>
        {/* Add more links here for future features */}
      </ul>
    </div>
  );
};

export default ProfileSidebar;
