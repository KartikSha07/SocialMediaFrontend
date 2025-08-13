// src/components/post/Post.jsx

import React, { useState } from "react";
import "./Post.scss";
import Avatar from "../avatar/Avatar";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { likeAndUnlikePosts, addComment, deleteComment } from "../../redux/slice/postSlice";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../redux/slice/appConfigSlice";
import { TOAST_FAILURE, TOAST_SUCCESS } from "../../App";
import { useEffect } from "react";
import { socket } from "../../utils/socket";
const Post = ({ post }) => {
  useEffect(() => {
    socket.emit("joinPost", post._id.toString());
    return () => {
      socket.emit("leavePost", post._id.toString());
    };
  }, [post._id]);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const [commentText, setCommentText] = useState("");

  const handlePostLike = () => {
    dispatch(likeAndUnlikePosts({ PostId: post._id }));
    post.isLiked === true ?   dispatch(showToast({ type: TOAST_FAILURE, message: "Post Unliked successfully!" })) 
                              : dispatch(showToast({ type: TOAST_SUCCESS, message: "Post liked successfully!" })) ;

  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    dispatch(addComment({ postId: post._id, text: commentText }));
    setCommentText("");
  };

  const handleDeleteComment = (commentId) => {
    dispatch(deleteComment({ postId: post._id, commentId }));
  };

  return (
    <div className="Post">
      <div className="profile-container" onClick={() => navigate(`/profile/${post.owner._id}`)}>
        <Avatar src={post.owner.avatar?.url} />
        <h4>{post.owner.name}</h4>
      </div>
      <div className="content">
        <img src={post?.image?.url} className="image" alt="content-image" />
      </div>
      <div className="footer">
        <div className="like" onClick={handlePostLike}>
          {post.isLiked ? (
            <AiFillHeart className="icon" style={{ color: "red" }} />
          ) : (
            <AiOutlineHeart className="icon" />
          )}
          <h4>{post.likesCount} Likes</h4>
        </div>
        <p className="caption">{post.caption}</p>
        <h5 className="time-ago">{post?.timeAgo}</h5>

        {/* Show comments */}
        <div className="comments-section">
          {post.comments?.map((c) => (
            <div key={c._id} className="comment">
              <Avatar src={c.user?.avatar?.url} size="small" />
              <div className="comment-content">
                <strong>{c.user?.name}</strong> {c.text}
                {c.user?._id === myProfile._id && (
                  <span className="delete-comment" onClick={() => handleDeleteComment(c._id)}>
                    ✕
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add comment form */}
        <div className="add-comment">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button onClick={handleAddComment}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default Post;
