import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../../shared/utils/utils";

const Login = () => {
  const [loginInfo, setLoginInfo] = React.useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({
      ...loginInfo,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = loginInfo;

    if (!email || !password) {
      return handleError("All fields are required");
    }

    try {
      const url = "http://localhost:3000/api/users/login";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });

      const data = await res.json();
      console.log("Login Response:", data);

      const { success, message, jwtToken, name } = data;

      if (success && jwtToken) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("loggedInUser");

        localStorage.setItem("jwtToken", jwtToken);
        localStorage.setItem("loggedInUser", name || "");

        handleSuccess(message);

        setTimeout(() => {
          window.location.reload();
        }, 400);
      } else {
        handleError(message || data.errors?.[0] || "Login failed");
      }
    } catch (err) {
      console.error(err);
      handleError(err.message || "Something went wrong");
    }
  };

  return (
    <>
      <img
        src="/images/figma.jpg"
        alt="Figma"
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />

      <div className="container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              id="email"
              placeholder="Enter your Email....."
              value={loginInfo.email}
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              id="password"
              placeholder="Enter your Password....."
              value={loginInfo.password}
            />
          </div>

          <button type="submit">Login</button>

          <span className="span">
            New User..? <Link to="/signup">Register</Link>
          </span>
        </form>
      </div>
    </>
  );
};

export default Login;