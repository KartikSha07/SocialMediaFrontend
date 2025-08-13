// src/components/SocketListener.jsx
import { useEffect } from "react";
import { socket } from "../utils/socket";
import { useDispatch, useSelector } from "react-redux";
import {
  addCommentFulfilled,
  deleteCommentFulfilled,
  likePostFulfilled
} from "../redux/socketActions";

export default function SocketListener() {
  const dispatch = useDispatch();
  const myProfile = useSelector(state => state.appConfigReducer.myProfile);

  useEffect(() => {
    socket.on("newComment", (data) => {
      dispatch(addCommentFulfilled(data));
    });

    socket.on("commentDeleted", (data) => {
      dispatch(deleteCommentFulfilled(data));
    });

    socket.on("postLiked", (data) => {
      // Add currentUserId so reducer can derive isLiked per client
      dispatch(likePostFulfilled({
        ...data,
        currentUserId: myProfile?._id
      }));
    });

    return () => {
      socket.off("newComment");
      socket.off("commentDeleted");
      socket.off("postLiked");
    };
  }, [dispatch, myProfile]);

  return null;
}
