// src/context/AppContext.js - FIXED VERSION
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../config/axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      console.log("🔑 Token check:", token); // Debugging
      
      if (!token) {
        console.log("❌ No token found");
        setUser(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      console.log("✅ Token found, fetching user...");
      const { data } = await api.get('/api/user/isauth');
      
      if (data.success) {
        console.log("🎉 User fetched successfully:", data.user);
        setUser(data.user);
      } else {
        console.log("❌ Invalid token response");
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.log("🚨 Auth check failed:", error.response?.data?.message || error.message);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  // ✅ Auto fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Manual user refresh function
  const refreshUser = async () => {
    await fetchUser();
  };

  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    loading,
    authChecked,
    fetchUser: refreshUser, // ✅ Better naming
    clearAuthData: () => {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};