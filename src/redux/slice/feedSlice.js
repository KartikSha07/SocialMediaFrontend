// src/redux/slice/feedSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";
import { likeAndUnlikePosts, addComment, deleteComment } from "./postSlice";
import { addCommentFulfilled, deleteCommentFulfilled, likePostFulfilled } from "../socketActions";

export const getFeedData = createAsyncThunk(
  "user/getFeedData",
  async () => {
    const res = await axiosClient.get("/users/getFeedData");
    return res.data.result;
  }
);

export const followAndUnfollowUser = createAsyncThunk(
  "user/followAndUnfollowUser",
  async (body) => {
    const res = await axiosClient.post("/users/follow", body);
    return res.data.result;
  }
);

const feedData = createSlice({
  name: "feedData",
  initialState: { feedData: {} },
  extraReducers: (builder) => {
    builder
      .addCase(getFeedData.fulfilled, (state, action) => {
        state.feedData = action.payload;
      })
      .addCase(likeAndUnlikePosts.fulfilled, (state, action) => {
        const postIndex = state.feedData?.posts?.findIndex(
          p => p._id?.toString() === action.payload._id?.toString()
        );
        if (postIndex !== -1) state.feedData.posts[postIndex] = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        const postIndex = state.feedData?.posts?.findIndex(
          p => p._id?.toString() === postId?.toString()
        );
        if (postIndex !== -1) {
          state.feedData.posts[postIndex].comments = comments;
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        const postIndex = state.feedData?.posts?.findIndex(
          p => p._id?.toString() === postId?.toString()
        );
        if (postIndex !== -1) {
          state.feedData.posts[postIndex].comments =
            state.feedData.posts[postIndex].comments.filter(
              c => c._id?.toString() !== commentId?.toString()
            );
        }
      })
      .addCase(addCommentFulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const postIndex = state.feedData?.posts?.findIndex(
          p => p._id?.toString() === postId?.toString()
        );
        if (postIndex !== -1) {
          state.feedData.posts[postIndex].comments.push(comment);
        }
      })
      .addCase(deleteCommentFulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        const postIndex = state.feedData?.posts?.findIndex(
          p => p._id?.toString() === postId?.toString()
        );
        if (postIndex !== -1) {
          state.feedData.posts[postIndex].comments =
            state.feedData.posts[postIndex].comments.filter(
              c => c._id?.toString() !== commentId?.toString()
            );
        }
      })
      .addCase(likePostFulfilled, (state, action) => {
        const { postId, likesCount, likes, currentUserId } = action.payload;
        const postIndex = state.feedData?.posts?.findIndex(
          p => p._id?.toString() === postId?.toString()
        );
        if (postIndex !== -1) {
          state.feedData.posts[postIndex].likesCount = likesCount;
          state.feedData.posts[postIndex].likes = likes;
          state.feedData.posts[postIndex].isLiked =
            likes.some(id => id?.toString() === currentUserId?.toString());
        }
      })
      .addCase(followAndUnfollowUser.fulfilled, (state, action) => {
        const user = action.payload.user;
        const userIdIndex = state.feedData?.followings?.findIndex(
          u => u._id?.toString() === user._id?.toString()
        );
        if (userIdIndex !== -1) {
          state.feedData.followings.splice(userIdIndex, 1);
        } else {
          state.feedData.followings.push(user);
        }
      });
  },
});

export default feedData.reducer;
