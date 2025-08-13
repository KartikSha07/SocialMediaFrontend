// src/components/Chat/ChatList.jsx
import React from 'react';

export default function ChatList({ chatList, onSelect, isFollowingList = false }) {
  return (
    <div>
      {chatList.length === 0 && (
        <div style={{ padding: "10px", color: "#888", fontSize: "0.85rem" }}>
          No users found
        </div>
      )}

      {chatList.map(chat => {
        let displayName = isFollowingList ? chat.name : chat.name || chat._id;
        let lastMessage = isFollowingList ? "" : chat.lastMessage;
        let avatarUrl = chat.avatar?.url;

        return (
          <div
            key={chat._id}
            onClick={() => onSelect(chat._id)}
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#ccc', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
              }}>
                {displayName[0]}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.95rem' }}>{displayName}</strong>
              {!isFollowingList && lastMessage && (
                <p style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  color: '#777',
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {lastMessage}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
