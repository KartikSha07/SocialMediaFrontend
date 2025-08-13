import { createAction } from "@reduxjs/toolkit";

export const addCommentFulfilled = createAction("socket/addCommentFulfilled");
export const deleteCommentFulfilled = createAction("socket/deleteCommentFulfilled");
export const likePostFulfilled = createAction("socket/likePostFulfilled");
