import React, { useState } from "react";
import "./Login.scss";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { KEY_ACCESS_TOKEN, setItem } from "../../utils/localStorageManager";
import { axiosClient } from "../../utils/axiosClient";

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (data) => {
    try {
      const response = await axiosClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const token = response.data?.result?.accessToken;
      if (token) {
        setItem(KEY_ACCESS_TOKEN, token);
        reset();
        navigate("/");
      } else {
        console.error("Login success but no accessToken found in response", response.data);
      }
    } catch (error) {
      console.error("Error in login", error);
    }
  };

  return (
    <div className="login">
      <div className="login-box">
        <h1 className="heading">Login</h1>
        <form onSubmit={handleSubmit(submitHandler)}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="email"
            id="email"
            autoComplete="username"
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
              autoComplete="current-password"
              required
              placeholder="Enter your password"
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
                fontSize: "1.15rem",
              }}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowPassword((prev) => !prev);
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <input type="submit" className="submit" value="Sign In" />
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
