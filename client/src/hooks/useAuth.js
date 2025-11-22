import { useState } from "react";

const useAuth = () => {
  const [token, setTokenState] = useState(localStorage.getItem("token") || "");

  const setToken = (value) => {
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(value);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setTokenState("");
  };

  return { token, setToken, logout };
};

export default useAuth;
