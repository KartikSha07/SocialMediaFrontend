import React from "react";
import "./Home.scss";
import Navbar from "../../components/navbar/Navbar";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="outlet-container" style={{ marginTop: "80px" }}>
        <Outlet />
      </div>
    </>
  );
};

export default Home;
