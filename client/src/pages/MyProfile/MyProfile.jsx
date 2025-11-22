import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfileSidebar from '../../components/ProfileSidebar/ProfileSidebar';
import './MyProfile.css';

const MyProfile = () => {
  return (
    <div className="myprofile-container">
      <ProfileSidebar />
      <div className="myprofile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MyProfile;
