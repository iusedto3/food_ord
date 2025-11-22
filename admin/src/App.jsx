import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/ProductList/ProductList";
import Orders from "./pages/AdminOrderList/AdminOrderList";
import Promotion from "./pages/Promotion/Promotion";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AdminOrderList from "./pages/AdminOrderList/AdminOrderList";

const App = () => {
  const url = "http://localhost:4000";
  const token = localStorage.getItem("adminToken");
  const location = useLocation();

  // 🧩 Nếu chưa login thì chỉ cho vào login / register
  if (!token && !["/login", "/register"].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <ToastContainer />
      {token && <Navbar />}
      <hr />
      <div className="app-content">
        {token && <Sidebar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add" element={<Add url={url} />} />
          <Route path="/productlist" element={<List url={url} />} />
          <Route path="/promotion" element={<Promotion url={url} />} />
          <Route path="/orderlist" element={<AdminOrderList url={url} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
