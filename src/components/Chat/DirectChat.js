import React, { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../../utils/socket";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { axiosClient } from "../../utils/axiosClient";
import Picker from "emoji-picker-react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import "./DirectChat.css";
import { useNavigate } from "react-router-dom";

const gf = new GiphyFetch(process.env.REACT_APP_GIPHY_API_KEY);

export default function DirectChat({ selectedUserId, onBack }) {
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchInput, setGifSearchInput] = useState("");
  const [gifSearchQuery, setGifSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);

  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    if (selectedUserId && myProfile?._id) {
      axiosClient.get(`/messages/${selectedUserId}`).then((res) => {
        const msgs = res.data.result.map((m) => ({
          fromUserId: String(m.from?._id || m.from),
          fromUser: m.from,
          message: m.message,
          imageUrl: m.imageUrl,
          gifUrl: m.gifUrl,
          inviteLink: m.inviteLink,
          messageId: m._id,
          timestamp: m.createdAt,
          read: m.read,
        }));
        setMessages(msgs);
      });
    }
  }, [selectedUserId, myProfile?._id]);

  useEffect(() => {
    if (selectedUserId) {
      // fetch the user we are chatting with
      axiosClient.get(`/users/${selectedUserId}`).then((res) => {
        setChatUser(res.data.result);
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("privateMessage", (msg) => {
      setMessages((prev) =>
        prev.some((m) => m.messageId === msg.messageId) ? prev : [...prev, msg]
      );
    });
    socket.on("typing", ({ fromUserId, name }) => {
      if (String(fromUserId) !== String(myProfile._id)) {
        setTypingUser(name);
        setTimeout(() => setTypingUser(null), 2000);
      }
    });
    return () => {
      socket.off("privateMessage");
      socket.off("typing");
    };
  }, [myProfile._id]);

  const onEmojiClick = (emoji) => setInput((prev) => prev + emoji.emoji);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setPreviewImage(reader.result);
  };
  const confirmImageSend = async () => {
    try {
      const res = await axiosClient.post("/messages/uploadImage", {
        image: previewImage,
      });
      sendMessage("", res.data.result.url, null);
      setPreviewImage(null);
    } catch {
      alert("Image upload failed");
    }
  };
  const sendMessage = (text = input, imageUrl = null, gifUrl = null) => {
    if (!text && !imageUrl && !gifUrl) return;
    const payload = {
      toUserId: selectedUserId,
      fromUserId: myProfile._id,
      message: text || null,
      imageUrl,
      gifUrl,
      messageId: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    socket.emit("privateMessage", payload);
    setInput("");
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setGifSearchInput("");
    setGifSearchQuery("");
  };
  const gifSelected = (gif) => {
    sendMessage("", null, gif.images.fixed_height.url);
  };
  const isMine = (msg) => String(msg.fromUserId) === String(myProfile._id);
  const fetchGifs = useCallback(
    (offset) => {
      if (gifSearchQuery && gifSearchQuery.trim()) {
        return gf.search(gifSearchQuery, {
          offset,
          limit: 30,
          rating: "pg",
          lang: "en",
        });
      }
      return gf.trending({ offset, limit: 30, rating: "pg" });
    },
    [gifSearchQuery]
  );

  return (
    <div className="chat-window">
      <div className="chat-header">
        {chatUser && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {chatUser.avatar?.url ? (
              <img
                src={chatUser.avatar.url}
                alt={chatUser.name}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#555",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  userSelect: "none",
                }}
              >
                {chatUser.name[0] || "U"}
              </div>
            )}
            <span>{chatUser.name}</span>
          </div>
        )}
      </div>
      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m.messageId}
            className={`msg-row ${isMine(m) ? "mine" : "other"}`}
          >
            {!isMine(m) && (
              <img
                className="avatar"
                src={m.fromUser?.avatar?.url || "/default-avatar.png"}
                alt="avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            )}
            <div className={`msg-bubble ${isMine(m) ? "mine" : "other"}`}>
              {m.message && <p className="msg-text">{m.message}</p>}
              {m.imageUrl && (
                <img src={m.imageUrl} alt="chat" className="msg-image" />
              )}
              {m.gifUrl && (
                <img src={m.gifUrl} alt="GIF" className="msg-image" />
              )}
              <div className="msg-meta">
                <span>
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMine(m) && m.read && <span className="msg-read">✓</span>}
              </div>
              {m.inviteLink && (
                <button
                  onClick={() =>
                    navigate(`/watch/${m.inviteLink.split("/").pop()}`)
                  }
                  style={{
                    background: "#3797f0",
                    color: "#fff",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                    marginTop: "6px",
                  }}
                >
                  Join Watch Party
                </button>
              )}
            </div>
          </div>
        ))}
        {typingUser && (
          <div
            style={{
              padding: "4px 10px",
              fontSize: "0.8rem",
              color: "#888",
              fontStyle: "italic",
            }}
          >
            {typingUser} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {previewImage && (
        <div className="preview-image-container">
          <img src={previewImage} alt="preview" />
          <div className="preview-image-actions">
            <button onClick={confirmImageSend}>Send</button>
            <button onClick={() => setPreviewImage(null)} className="cancel">
              Cancel
            </button>
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div className="emoji-picker-popup">
          <Picker onEmojiClick={(e) => onEmojiClick(e)} />
        </div>
      )}
      {showGifPicker && (
        <div className="gif-picker-popup">
          <div className="gif-search-bar">
            <input
              className="gif-search-input"
              type="text"
              placeholder="Search GIFs"
              value={gifSearchInput}
              onChange={(e) => setGifSearchInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && setGifSearchQuery(gifSearchInput.trim())
              }
            />
            <button
              className="gif-search-btn"
              onClick={() => setGifSearchQuery(gifSearchInput.trim())}
            >
              Search
            </button>
          </div>
          <Grid
            key={gifSearchQuery}
            width={300}
            columns={3}
            gutter={6}
            fetchGifs={fetchGifs}
            onGifClick={(gif, e) => {
              e.preventDefault();
              gifSelected(gif);
            }}
          />
        </div>
      )}

      <div className="chat-input-area">
        <button
          type="button"
          className="emoji-btn"
          onClick={() => {
            setShowEmojiPicker((v) => !v);
            setShowGifPicker(false);
          }}
        >
          😀
        </button>
        <button
          type="button"
          className="gif-btn"
          onClick={() => {
            setShowGifPicker((v) => !v);
            setShowEmojiPicker(false);
          }}
        >
          GIF
        </button>
        <input
          type="file"
          accept="image/*"
          id="chatImageInput"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <label htmlFor="chatImageInput" className="upload-btn">
          Upload
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            socket.emit("typing", {
              toUserId: selectedUserId,
              fromUserId: myProfile._id,
              name: myProfile.name,
            });
          }}
          placeholder="Message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="send-btn" onClick={() => sendMessage()}>
          Send
        </button>
      </div>
    </div>
  );
}
