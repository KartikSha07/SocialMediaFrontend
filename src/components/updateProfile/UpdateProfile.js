import React, { useEffect, useState } from "react";
import "./UpdateProfile.scss";
import backImg from "../../assets/profile.png";
import { useDispatch, useSelector } from "react-redux";
import { updateMyProfile } from "../../redux/slice/appConfigSlice";
import { KEY_ACCESS_TOKEN, removeItem } from "../../utils/localStorageManager";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";

const UpdateProfile = () => {
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [userImg, setUserImg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (myProfile) {
      setName(myProfile.name || "");
      setBio(myProfile.bio || "");
      setUserImg(myProfile?.avatar?.url);
    }
  }, [myProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      if (fileReader.readyState === fileReader.DONE) {
        setUserImg(fileReader.result);
      }
    };
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updateMyProfile({
        name,
        bio,
        userImg,
      })
    );
  };
  const handleAccountDelete = async () => {
    try {
      await axiosClient.delete(`/users/deleteUser`);
      localStorage.removeItem("token");
      removeItem(KEY_ACCESS_TOKEN);
      navigate("/login");
    } catch (e) {
      console.log("error in deleting account", e);
    }
  };
  return (
    <div className="UpdateProfile">
      <div className="container">
        <div className="left-part">
          <div className="input-user-img">
            <label htmlFor="inputImg" className="labelImg">
              <img
                src={userImg ? userImg : backImg}
                alt="user-img"
                className="user-img"
              />
            </label>
            <input
              id="inputImg"
              className="inputImg"
              type="file"
              accept="image/*"
              name="userImage"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="right-part">
          <form onSubmit={(e) => handleSubmit(e)}>
            <input
              type="text"
              value={name}
              placeholder="Your Name"
              name="userName"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              value={bio}
              placeholder="Your Bio"
              name="userBio"
              onChange={(e) => setBio(e.target.value)}
            />
            <input type="submit" className="btn-primary" />
          </form>

          <button
            className="delete-account btn-primary"
            onClick={handleAccountDelete}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
