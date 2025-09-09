import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ add useNavigate
import Navbar from "../Navbar/Navbar.jsx";
import "./Login.css";
import promoPhoto from "../assets/promo-photo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Login successful!");
        navigate("/"); // ✅ redirect to homepage
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed, please try again.");
    }
  };

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-wrapper">
        <div className="login-form">
          <div className="logo">
            <img src="/logo.png" alt="Nebula Logo" />
          </div>
          <h2>Welcome back</h2>
          <p className="subtitle">Please enter your account details</p>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="options">
              <label>
                <input type="checkbox" /> Keep me logged in
              </label>
              <a href="#">Forgot Password</a>
            </div>

            <button type="submit" className="btn">
              Sign In
            </button>

            <p className="signup">
              Don’t have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        </div>

        <div className="login-promo">
          <img src={promoPhoto} alt="Promo" className="promo-image" />
        </div>
      </div>
    </div>
  );
}
