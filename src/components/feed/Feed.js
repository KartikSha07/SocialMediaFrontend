import React, { useEffect } from "react";
import "./Feed.scss";
import Post from "../Post/Post";
import Follower from "../follower/Follower";
import CreatePost from "../createPost/CreatePost";
import { useDispatch, useSelector } from "react-redux";
import { getFeedData } from "../../redux/slice/feedSlice";

const Feed = () => {
  const dispatch = useDispatch();
  const feedData = useSelector(state => state.feedReducer.feedData);
  console.log("feedData is ", feedData);

  useEffect(() => {
    dispatch(getFeedData());
  }, [dispatch]);

  return (
    <div className="Feed">
      <div className="container">
        <div className="left-part">
          <CreatePost />
          {feedData?.posts?.map(post => (
            <Post key={post._id} post={post} />
          ))}
        </div>
        <div className="right-part">
          <div className="following">
            <h3 className="title">You are following</h3>
            {feedData?.followings?.map(user => (
              <Follower user={user} key={user._id} />
            ))}
          </div>
          <div className="suggestions">
            <h3 className="title">Suggestions</h3>
            {feedData?.suggestion?.map(user => (
              <Follower user={user} key={user._id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
