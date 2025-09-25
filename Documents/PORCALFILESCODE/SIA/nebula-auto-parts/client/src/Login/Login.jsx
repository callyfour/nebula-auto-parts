import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import "./Login.css";
import promoPhoto from "../assets/promo-photo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        // Save token and user in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Login failed, please try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE}/api/auth/google`;
  };

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-wrapper">
        <div className="login-form">
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

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* ✅ Google Login Button */}
            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </button>

            {error && <p className="error-message">{error}</p>}

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
