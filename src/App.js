import React, { useEffect, useRef } from "react";
import Login from "./pages/login/Login";
import { Route, Routes } from "react-router-dom";
import SignUp from "./pages/signup/SignUp";
import Home from "./pages/home/Home";
import RequiredUser from "./components/RequiredUser";
import Feed from "./components/feed/Feed";
import Profile from "./components/profile/Profile";
import UpdateProfile from "./components/updateProfile/UpdateProfile";
import { useSelector, useDispatch } from "react-redux";
import LoadingBar from "react-top-loading-bar";
import OnlyLogin from "./components/OnlyLogin";
import toast, { Toaster } from "react-hot-toast";

import { socket } from "./utils/socket";
import SocketListener from "./components/SocketListener";
import MessagesPage from "./components/Chat/MessagesPage";
import { getMyInfo } from "./redux/slice/appConfigSlice";
import { getItem, KEY_ACCESS_TOKEN } from "./utils/localStorageManager";
import UserSearch from "./components/search/UserSearch";

import WatchPartyLobby from "./components/watchParty/WatchPartyLobby";
import WatchParty from "./components/watchParty/WatchParty";
import WatchPartyPage from "./components/watchParty/watchPartyPage";

export const TOAST_SUCCESS = "toast_success";
export const TOAST_FAILURE = "toast_failure";

const App = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.appConfigReducer.isLoading);
  const toastData = useSelector((state) => state.appConfigReducer.toastData);
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const loadRef = useRef(null);

  // ✅ Load user profile only if token exists
  useEffect(() => {
    const token = getItem(KEY_ACCESS_TOKEN);
    if (token) {
      dispatch(getMyInfo());
    }
  }, [dispatch]);
  // Loading bar sync
  useEffect(() => {
    if (isLoading) loadRef.current?.continuousStart();
    else loadRef.current?.complete();
  }, [isLoading]);

  // Toast notifications sync
  useEffect(() => {
    switch (toastData.type) {
      case TOAST_SUCCESS:
        toast.success(toastData.message);
        break;
      case TOAST_FAILURE:
        toast.error(toastData.message);
        break;
      default:
        break;
    }
  }, [toastData]);

  // ✅ Connect to socket after logged in
  useEffect(() => {
    if (myProfile?._id) {
      socket.emit("userConnected", myProfile._id);
    }
  }, [myProfile?._id]);

  return (
    <div>
      <SocketListener />
      <LoadingBar color="#000" ref={loadRef} loaderSpeed={500} />
      <Toaster />

      <Routes>
        <Route element={<RequiredUser />}>
          <Route path="/" element={<Home />}>
            <Route path="/" element={<Feed />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/updateProfile" element={<UpdateProfile />} />
            <Route path="/search" element={<UserSearch />} />{" "}
            {/* 🔍 New Route */}
          </Route>
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:id" element={<MessagesPage />} />
        </Route>

        <Route element={<OnlyLogin />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
        <Route path="/watch" element={<WatchPartyPage />} />
        <Route path="/watch/:roomId" element={<WatchParty />} />
      </Routes>
    </div>
  );
};

export default App;
