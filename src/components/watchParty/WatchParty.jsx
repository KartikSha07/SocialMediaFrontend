import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import YouTube from "react-youtube";
import { socket } from "../../utils/socket";
import { useSelector } from "react-redux";
import { axiosClient } from "../../utils/axiosClient";
import YouTubeSearch from "./YouTubeSearch";
import "./WatchParty.scss";

export default function WatchParty() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const myProfile = useSelector((s) => s.appConfigReducer.myProfile);

  const [player, setPlayer] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoQueue, setVideoQueue] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [inviteBox, setInviteBox] = useState(false);
  const [followList, setFollowList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showEndModal, setShowEndModal] = useState(false);
  const chatEndRef = useRef();

  // --- Sync threshold (seconds) ---
  const SYNC_THRESHOLD = 0.5;

  const getPlayerTime = () =>
    player?.getCurrentTime ? player.getCurrentTime() : 0;
  const seekPlayer = (time) => player?.seekTo && player.seekTo(time, true);
  const playPlayer = () => player?.playVideo && player.playVideo();
  const pausePlayer = () => player?.pauseVideo && player.pauseVideo();

  // --- SOCKET ---
  useEffect(() => {
    socket.emit("joinWatchRoom", { roomId, userId: myProfile._id });

    socket.on("watchRoomState", (room) => {
      setCurrentVideo(room.currentVideo);
      setVideoQueue(room.videoQueue);
      setChatMessages(room.chatMessages);
      setIsCreator(
        room.createdBy?._id === myProfile._id ||
          room.createdBy === myProfile._id
      );

      if (room.createdBy?._id === myProfile._id) {
        Promise.all([
          axiosClient.get("/users/myFollowings"),
          axiosClient.get("/users/myFollowers"),
        ]).then(([f1, f2]) => {
          const merge = {};
          [...(f1.data.result || []), ...(f2.data.result || [])].forEach(
            (u) => (merge[u._id] = u)
          );
          setFollowList(Object.values(merge));
        });
      }
    });

    socket.on("queueUpdated", (d) => {
      setCurrentVideo(d.currentVideo);
      setVideoQueue(d.videoQueue);
    });

    socket.on("videoChanged", (d) => {
      setCurrentVideo(d.currentVideo);
      setVideoQueue(d.videoQueue);
    });

    socket.on("watchPartyEnded", () => {
      navigate("/watch");
    });

    socket.on("watchChatMessage", (msg) =>
      setChatMessages((prev) => [...prev, msg])
    );

    // ✅ Smooth sync on play
    socket.on("watchPlay", ({ currentTime }) => {
      if (!player) return;
      const localTime = getPlayerTime();
      const diff = Math.abs(localTime - currentTime);
      if (diff > SYNC_THRESHOLD) {
        seekPlayer(currentTime);
      }
      playPlayer();
    });

    // ✅ Smooth sync on pause
    socket.on("watchPause", ({ currentTime }) => {
      if (!player) return;
      const localTime = getPlayerTime();
      const diff = Math.abs(localTime - currentTime);
      if (diff > SYNC_THRESHOLD) {
        seekPlayer(currentTime);
      }
      pausePlayer();
    });

    return () => {
      socket.emit("leaveWatchRoom", { roomId, userId: myProfile._id });
      socket.off();
    };
  }, [roomId, myProfile._id, player, navigate]);

  // ✅ Emit events only when needed (avoid spam)
  const lastEmit = useRef({ play: 0, pause: 0 });
  const emitEvent = (evt) => {
    if (!player) return;
    const nowTime = getPlayerTime();
    const lastTime = lastEmit.current[evt.includes("Play") ? "play" : "pause"];
    if (Math.abs(nowTime - lastTime) > SYNC_THRESHOLD) {
      socket.emit(evt, { roomId, currentTime: nowTime });
      lastEmit.current[evt.includes("Play") ? "play" : "pause"] = nowTime;
    }
  };

  const onPlayerReady = (e) => setPlayer(e.target);
  const addVideo = (id, title) =>
    socket.emit("addVideoToQueue", { roomId, videoId: id, title });
  const skipVideo = () => socket.emit("skipVideo", { roomId });
  const removeFromQueue = (index) =>
    socket.emit("removeFromQueue", { roomId, index });
  const sendChat = () => {
    if (chatText.trim()) {
      socket.emit("watchChatMessage", {
        roomId,
        userId: myProfile._id,
        message: chatText,
      });
      setChatText("");
    }
  };
  const sendInvites = async () => {
    await axiosClient.post(`/watchParty/inviteMore/${roomId}`, {
      newInvites: selected.map((x) => x._id),
    });
    setInviteBox(false);
  };
  const confirmEndStream = async () => {
    await axiosClient.delete(`/watchParty/end/${roomId}`);
    navigate("/watch");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="watchparty-root">
      <div className="watchparty-header">
        <button className="watchparty-btn" onClick={() => navigate("/watch")}>
          ← Back
        </button>
        <div className="watchparty-title">Watch Party</div>
        {isCreator && (
          <button
            className="watchparty-btn danger"
            onClick={() => setShowEndModal(true)}
          >
            End Stream
          </button>
        )}
      </div>

      <div className="watchparty-main">
        <div className="watchparty-left">
          {isCreator && (
            <>
              <button
                className="watchparty-btn"
                style={{ marginBottom: 10 }}
                onClick={() => setInviteBox(!inviteBox)}
              >
                Invite More
              </button>
              {inviteBox && (
                <div className="watchparty-card">
                  {followList.map((u) => (
                    <label key={u._id} className="invite-label">
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          setSelected((prev) =>
                            e.target.checked
                              ? [...prev, u]
                              : prev.filter((x) => x._id !== u._id)
                          )
                        }
                      />{" "}
                      {u.name}
                    </label>
                  ))}
                  <button className="watchparty-btn" onClick={sendInvites}>
                    Send
                  </button>
                </div>
              )}
            </>
          )}

          <div className="video-container">
            {currentVideo?.videoId ? (
              <YouTube
                videoId={currentVideo.videoId}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: { autoplay: 0 },
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                onReady={onPlayerReady}
                onPlay={() => emitEvent("watchPlay")}
                onPause={() => emitEvent("watchPause")}
              />
            ) : (
              <span className="no-video-text">No video playing</span>
            )}
          </div>

          <YouTubeSearch onSelectVideo={addVideo} />

          <div className="watchparty-card watchparty-queue">
            <h3>Up Next</h3>
            {videoQueue.length === 0 ? (
              <p className="muted">No videos queued</p>
            ) : (
              videoQueue.map((vid, i) => (
                <div key={i} className="queue-row">
                  <span>{vid.title}</span>
                  <button
                    className="watchparty-btn small"
                    onClick={() => removeFromQueue(i)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
            {currentVideo?.videoId && (
              <button className="watchparty-btn" onClick={skipVideo}>
                Skip Current Video
              </button>
            )}
          </div>
        </div>

        <div className="watchparty-right">
          <div className="chat-area">
            {chatMessages.map((m, i) => (
              <div key={i} className="chat-row">
                {m.user?.avatar?.url ? (
                  <img
                    src={m.user.avatar.url}
                    alt={m.user.name}
                    className="chat-avatar"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      // if image fails to load, fallback to showing initials
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = "none"; // hide broken image
                      e.currentTarget.nextSibling.style.display = "flex"; // show initials div
                    }}
                  />
                ) : null}
                {!m.user?.avatar?.url && (
                  <div
                    className="avatar-placeholder"
                    style={{
                      width: 28,
                      height: 28,
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
                    {m.user?.name ? m.user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className="chat-message-box">
                  <b>{m.user?.name}</b>
                  <div>{m.message}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-row">
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button className="watchparty-btn" onClick={sendChat}>
              Send
            </button>
          </div>
        </div>
      </div>

      {showEndModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>End Stream?</h3>
            <p>Are you sure you want to end this watch party?</p>
            <div className="modal-actions">
              <button
                className="watchparty-btn"
                style={{ background: "#ccc", color: "#333" }}
                onClick={() => setShowEndModal(false)}
              >
                Cancel
              </button>
              <button
                className="watchparty-btn danger"
                onClick={confirmEndStream}
              >
                Yes, End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
