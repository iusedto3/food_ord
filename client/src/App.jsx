import Navbar from "./components/Navbar/Navbar";
import "./index.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import { useState } from "react";
import SignUp from "./pages/SignUp/SignUp";
import Success from "./pages/Success/Success";
import SignIn from "./pages/SignIn/SignIn";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import MyProfile from "./pages/MyProfile/MyProfile";
import ProfileInfo from "./components/ProfileInfo/ProfileInfo";
import OrderHistory from "./components/OrderHistory/OrderHistory";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<PlaceOrder />} />
          <Route path="/success/:orderId" element={<Success />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/myprofile" element={<MyProfile />}>
            <Route path="" element={<Navigate to="info" replace />} />
            <Route path="info" element={<ProfileInfo />} />
            <Route path="orders" element={<OrderHistory />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;

