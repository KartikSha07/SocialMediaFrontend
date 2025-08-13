// src/components/RequiredUser.jsx
import React, { useEffect, useState } from "react";
import { getItem, KEY_ACCESS_TOKEN, removeItem } from "../utils/localStorageManager";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyInfo } from "../redux/slice/appConfigSlice";

const RequiredUser = () => {
  const dispatch = useDispatch();
  const token = getItem(KEY_ACCESS_TOKEN);
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        try {
          await dispatch(getMyInfo()).unwrap();
        } catch (err) {
          console.warn("Auth check failed:", err);
          removeItem(KEY_ACCESS_TOKEN);
        }
      }
      setChecking(false);
    };
    checkUser();
  }, [token, dispatch]);

  if (checking) {
    return <div>Loading...</div>;
  }

  if (!token || !myProfile?._id) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RequiredUser;
