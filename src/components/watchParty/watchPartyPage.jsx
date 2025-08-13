import React, { useEffect, useState } from "react";
import { axiosClient } from "../../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import WatchPartyLobby from "./WatchPartyLobby";
import { useSelector } from "react-redux";
import "./WatchParty.scss";

export default function WatchPartyPage() {
  const myProfile = useSelector(s => s.appConfigReducer.myProfile);
  const [invites, setInvites] = useState([]);
  const [hostRoom, setHostRoom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/watchParty/my-invites").then(res => {
      const rooms = res.data.result || [];
      const myRooms = rooms.filter(r => r.createdBy?._id === myProfile._id || r.createdBy === myProfile._id);
      setHostRoom(myRooms[0] || null);
      setInvites(rooms.filter(r => !myRooms.some(mr => mr._id === r._id)));
    });
  }, [myProfile._id]);

  const removeInvite = async (roomId) => {
    await axiosClient.post(`/watchParty/removeInvite/${roomId}`);
    setInvites(prev => prev.filter(i => i._id !== roomId));
  };

  return (
    <div className="watchparty-root" style={{ paddingTop: "40px" }}>
      <div className="watchparty-main">
        <div className="watchparty-left">
          <button className="watchparty-btn" onClick={() => navigate("/")}>← Back to Feed</button>
          <h3>Create a New Room</h3>
          <WatchPartyLobby />
        </div>

        <div className="watchparty-right" style={{ padding: 16 }}>
          <h3>Your Active Room</h3>
          {hostRoom ? (
            <div className="watchparty-card">
              <b>{hostRoom.name}</b> (Host)
              <br />
              <button className="watchparty-btn" onClick={() => navigate(`/watch/${hostRoom._id}`)}>Join Your Room</button>
            </div>
          ) : <p className="muted">No active created room</p>}

          <h3>Pending Invites</h3>
          {invites.length === 0 && <p className="muted">No invites</p>}
          {invites.map(inv => (
            <div key={inv._id} className="watchparty-card">
              <strong>{inv.createdBy?.name}</strong> invites you to <em>{inv.name}</em>
              <br />
              <button className="watchparty-btn" onClick={() => navigate(`/watch/${inv._id}`)}>Join</button>
              <button className="watchparty-btn danger" onClick={() => removeInvite(inv._id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
