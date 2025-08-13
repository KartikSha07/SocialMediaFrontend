import React, { useEffect, useState } from "react";
import "./Profile.scss";
import Post from "../Post/Post";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../redux/slice/postSlice";
import CreatePost from "../createPost/CreatePost";
import { followAndUnfollowUser } from "../../redux/slice/feedSlice";
import backImg from "../../assets/profile.png";


const Profile = () => {
  const navigate = useNavigate();
  const params = useParams();

  const dispatch = useDispatch();
  const userProfile = useSelector(
    (state) => state.postSliceReducer.userProfile
  );
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const feedData = useSelector((state) => state.feedReducer.feedData);

  useEffect(() => {
    dispatch(getUserProfile({ userId: params.id }));
    setIsMyProfile(myProfile?._id === params.id);
    setIsFollowing(
      feedData?.followings?.find((item) => item._id === params.id)
    );
  }, [myProfile, params.id, feedData,dispatch]);


  const handleFollower = () => {
    dispatch(followAndUnfollowUser({ userIdToFollow: params.id }));
  };
  return (
    <div className="Profile">
      <div className="container">
        <div className="left-part">
          {isMyProfile && <CreatePost />}
          {userProfile?.posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
        <div className="right-part">
          <div className="profile-card">
            <img
              src={userProfile?.avatar?.url ? userProfile.avatar.url : backImg}
              alt="user-img"
              className="user-img"
            />
            <h3 className="userName">{userProfile.name}</h3>
            <h5 className="bio">{userProfile.bio}</h5>
            <div className="follower-info">
              <h4>{`${userProfile?.followings?.length} Followings`}</h4>
              <h4>{`${userProfile?.followers?.length} Followers`}</h4>
            </div>
            {!isMyProfile && (
              <h5
                style={{ marginTop: "10px" }}
                className={
                  isFollowing ? "hover-link follow-link" : "btn-primary"
                }
                onClick={handleFollower}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </h5>
            )}
            {isMyProfile && (
              <button
                className="update-profile btn-secondary"
                onClick={() => {
                  navigate("/updateProfile");
                }}
              >
                Update Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
