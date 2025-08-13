import React, { useEffect, useState } from "react";
import "./Navbar.scss";
import Avatar from "../avatar/Avatar";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineLogout,
  AiOutlineMessage,
  AiOutlineSearch,
} from "react-icons/ai";
import { useSelector } from "react-redux";
import { KEY_ACCESS_TOKEN, removeItem } from "../../utils/localStorageManager";
import { axiosClient } from "../../utils/axiosClient";
import tokomoko from "../../assets/blinksy.png";
import { MdOutlineVideoLibrary } from "react-icons/md"; 
import { socket } from "../../utils/socket";

const Navbar = () => {
  const navigate = useNavigate();
  const loadState = useSelector((state) => state.appConfigReducer.isLoading);
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    // Load invites on mount
    axiosClient
      .get("/watchParty/my-invites")
      .then((res) => setInvites(res.data.result || []));

    // Listen for new invites in real time
    socket.on("watchPartyInvite", (invite) => {
      setInvites((prev) => [...prev, invite]);
    });

    return () => socket.off("watchPartyInvite");
  }, []);

  async function handleLogoutClicked() {
    try {
      console.log(loadState, "curr state");
      await axiosClient.get("/auth/logout");
      removeItem(KEY_ACCESS_TOKEN);
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="navbar">
      <div className="container">
        {/* Logo */}
        <h2 className="navbar-header hover-link" onClick={() => navigate("/")}>
          <img src={tokomoko} alt="Logo" />
        </h2>

        {/* Right side icons */}
        <div className="right-side">
          {/* Search */}
          <div className="icon-btn search" onClick={() => navigate("/search")}>
            <AiOutlineSearch />
          </div>

          {/* Watch Party with invites badge */}
          <div
            className="icon-btn watchparty"
            onClick={() => navigate("/watch")}
            title="Watch Party"
          >
            <MdOutlineVideoLibrary />
            {invites.length > 0 && <span>{invites.length}</span>}
          </div>

          {/* Messages */}
          <div
            className="icon-btn messages"
            onClick={() => navigate("/messages")}
          >
            <AiOutlineMessage />
          </div>

          {/* Profile */}
          <div
            className="profile"
            onClick={() => navigate(`/profile/${myProfile._id}`)}
          >
            <Avatar src={myProfile?.avatar?.url} />
          </div>

          {/* Logout */}
          <div className="icon-btn logout" onClick={handleLogoutClicked}>
            <AiOutlineLogout />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
