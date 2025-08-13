import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.scss";
import { useForm } from "react-hook-form";
import { axiosClient } from "../../utils/axiosClient";

const SignUp = () => {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (data) => {
    try {
      const response = await axiosClient.post("/auth/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      console.log("SignUp successful", response.data);
      reset();
      navigate("/login");
    } catch (error) {
      console.error("Error in signup", error);
      // Optionally display error to user
    }
  };

  return (
    <div className="signup">
      <div className="signup-box">
        <h1 className="heading">Sign Up</h1>
        <form onSubmit={handleSubmit(submitHandler)}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="name"
            id="name"
            required
            placeholder="Enter your name"
            {...register("name")}
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="email"
            id="email"
            required
            placeholder="Enter your email"
            {...register("email")}
          />

          <label htmlFor="password">Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className="password"
              id="password"
              required
              placeholder="Create a password"
              {...register("password")}
            />
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#8fa4d6",
                fontSize: "1.15rem"
              }}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setShowPassword((prev) => !prev); }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <input type="submit" className="submit" value="Create Account" />
        </form>
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
