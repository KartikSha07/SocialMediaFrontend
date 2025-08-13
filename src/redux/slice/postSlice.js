// src/redux/slice/postSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";
import { addCommentFulfilled, deleteCommentFulfilled, likePostFulfilled } from "../socketActions";

export const getUserProfile = createAsyncThunk(
  "user/getUserProfile",
  async (data) => {
    const res = await axiosClient.post("/users/getUserProfile", data);
    return res.data.result;
  }
);

export const likeAndUnlikePosts = createAsyncThunk(
  "posts/likeUnlike",
  async (data) => {
    const res = await axiosClient.post("posts/likeAndUnlike", data);
    return res.data.result.post;
  }
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, text }) => {
    const res = await axiosClient.post("/posts/addComment", { postId, text });
    return { postId, comments: res.data.result.comments };
  }
);

export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }) => {
    await axiosClient.delete("/posts/deleteComment", { data: { postId, commentId } });
    return { postId, commentId };
  }
);

const postSlice = createSlice({
  name: "postSlice",
  initialState: {
    userProfile: {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
      })
      .addCase(likeAndUnlikePosts.fulfilled, (state, action) => {
        const post = action.payload;
        if (state?.userProfile?.posts) {
          const postIndex = state.userProfile.posts.findIndex(
            p => p._id?.toString() === post._id?.toString()
          );
          if (postIndex !== -1) {
            state.userProfile.posts[postIndex] = post;
          }
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        if (state?.userProfile?.posts) {
          const postIndex = state.userProfile.posts.findIndex(
            p => p._id?.toString() === postId?.toString()
          );
          if (postIndex !== -1) {
            state.userProfile.posts[postIndex].comments = comments;
          }
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        if (state?.userProfile?.posts) {
          const postIndex = state.userProfile.posts.findIndex(
            p => p._id?.toString() === postId?.toString()
          );
          if (postIndex !== -1) {
            state.userProfile.posts[postIndex].comments =
              state.userProfile.posts[postIndex].comments.filter(
                c => c._id?.toString() !== commentId?.toString()
              );
          }
        }
      })
      .addCase(addCommentFulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (state?.userProfile?.posts) {
          const postIndex = state.userProfile.posts.findIndex(
            p => p._id?.toString() === postId?.toString()
          );
          if (postIndex !== -1) {
            state.userProfile.posts[postIndex].comments.push(comment);
          }
        }
      })
      .addCase(deleteCommentFulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        if (state?.userProfile?.posts) {
          const postIndex = state.userProfile.posts.findIndex(
            p => p._id?.toString() === postId?.toString()
          );
          if (postIndex !== -1) {
            state.userProfile.posts[postIndex].comments =
              state.userProfile.posts[postIndex].comments.filter(
                c => c._id?.toString() !== commentId?.toString()
              );
          }
        }
      })
      .addCase(likePostFulfilled, (state, action) => {
        const { postId, likesCount, likes, currentUserId } = action.payload;
        if (state?.userProfile?.posts) {
          const postIndex = state.userProfile.posts.findIndex(
            p => p._id?.toString() === postId?.toString()
          );
          if (postIndex !== -1) {
            state.userProfile.posts[postIndex].likesCount = likesCount;
            state.userProfile.posts[postIndex].likes = likes;
            state.userProfile.posts[postIndex].isLiked =
              likes.some(id => id?.toString() === currentUserId?.toString());
          }
        }
      });
  },
});

export default postSlice.reducer;
