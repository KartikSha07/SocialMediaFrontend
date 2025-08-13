import React, { useEffect, useState } from 'react';
import { axiosClient } from "../../utils/axiosClient";
import ChatList from './ChatList';
import DirectChat from './DirectChat';
import { useParams, useNavigate } from 'react-router-dom';
import './MessagesPage.css'; // we'll add styles

export default function MessagesPage() {
  const [chatList, setChatList] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { id: selectedUserId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await axiosClient.get("/messages/list");
      setChatList(res.data.result);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await axiosClient.get("/users/myFollowings");
      setFollowings(res.data.result);
    })();
  }, []);

  const filteredFollowings = followings.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="messages-container">
      {/* Left Panel */}
      <div className="chat-list-panel">
        <div className="chat-list-header">
          <button
            onClick={() => navigate("/")}
            className="back-to-feed-btn"
          >
            ← Feed
          </button>
          <span>Chats</span>
        </div>

        <div className="chat-list-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <h4 className="chat-list-label">Contacts</h4>
        <ChatList
          chatList={filteredFollowings}
          onSelect={(uid) => navigate(`/messages/${uid}`)}
          isFollowingList={true}
        />
      </div>

      {/* Right Panel */}
      <div className="chat-window-panel">
        {selectedUserId ? (
          <DirectChat
            selectedUserId={selectedUserId}
            onBack={() => navigate('/messages')}
          />
        ) : (
          <div className="no-chat-selected">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
