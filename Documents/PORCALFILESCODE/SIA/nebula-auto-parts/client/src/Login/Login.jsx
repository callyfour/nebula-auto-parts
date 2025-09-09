import { useState } from "react";
import Navbar from "../Navbar/Navbar.jsx"; // adjust path if needed
import "./Login.css"; // import external css
import promoPhoto from "../assets/promo-photo.png";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <div className="login-container">
      <Navbar />

      <div className="login-wrapper">
        {/* Left - Login Form */}
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
              Don’t have an account? <a href="#">Sign up</a>
            </p>
          </form>
        </div>

        {/* Right - Promo Section */}
        <div className="login-promo">
          <img src={promoPhoto} alt="Promo" className="promo-image" />
        </div>
      </div>
    </div>
  );
}
