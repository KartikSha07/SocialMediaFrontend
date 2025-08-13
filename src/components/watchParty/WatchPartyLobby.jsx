import React, { useEffect, useState, useMemo } from "react";
import { axiosClient } from "../../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "./WatchParty.scss";

export default function WatchPartyLobby() {
  const [roomName, setRoomName] = useState("");
  const [followings, setFollowings] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/users/myFollowings").then(res => setFollowings(res.data.result || []));
    axiosClient.get("/users/myFollowers").then(res => setFollowers(res.data.result || []));
  }, []);

  const combinedUsers = useMemo(() => {
    const map = new Map();
    [...followings, ...followers].forEach(u => {
      if (!map.has(u._id)) map.set(u._id, u);
    });
    return [...map.values()];
  }, [followings, followers]);

  const options = combinedUsers.map(u => ({
    value: u._id,
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src={u.avatar?.url || "/default-avatar.png"} alt="" width={28} height={28} style={{ borderRadius: "50%" }} />
        {u.name}
      </div>
    ),
    userId: u._id
  }));

  const create = async () => {
    if (!roomName.trim()) return alert("Please enter a room name");
    const res = await axiosClient.post("/watchParty/create", {
      name: roomName,
      invitedUsers: invitedUsers.map(o => o.userId)
    });
    navigate(`/watch/${res.data.result._id}`);
  };

  return (
    <div className="watchparty-card">
      <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Room Name"
             style={{ width: "100%", padding: 8, marginBottom: 10 }} />
      <Select isMulti options={options} value={invitedUsers} onChange={setInvitedUsers} placeholder="Select people to invite..." />
      <button className="watchparty-btn" style={{ marginTop: 10 }} onClick={create}>Create Room</button>
    </div>
  );
}
