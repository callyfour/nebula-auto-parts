import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx"; // ✅ Adjust path
import Navbar from "../Navbar/Navbar.jsx";
import "./Login.css";
import promoPhoto from "../assets/promo-photo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login: contextLogin } = useAuth(); // ✅ Now safe – provider is above

  // ✅ Redirect if already logged in (global via context)
  useEffect(() => {
    if (user) {
      console.log("Already logged in via context, redirecting:", user); // Debug
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate]);

  // ✅ Handle Google callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userEncoded = params.get("user");

    if (token && userEncoded) {
      try {
        const userDecoded = decodeURIComponent(userEncoded);
        const parsedUser = JSON.parse(userDecoded);

        contextLogin(token, parsedUser); // ✅ Use context instead of localStorage

        console.log("Google login via context:", parsedUser); // Debug

        window.history.replaceState({}, "", window.location.pathname);

        if (parsedUser.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Failed to parse Google user data:", err);
        setError("Failed to process Google login. Please try again.");
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [location, navigate, contextLogin]);

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
        contextLogin(data.token, data.user); // ✅ Use context

        console.log("Regular login via context:", data.user); // Debug

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
    const returnTo = location.pathname + location.search;
    const googleUrl = `${
      import.meta.env.VITE_API_BASE
    }/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.href = googleUrl;
  };

  // If still loading from context, show nothing or spinner (but context handles global loading)
  if (loading) return <div>Loading...</div>; // Optional

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
                <input type="checkbox" id="keepLoggedIn" /> Keep me logged in
              </label>
              <a href="/forgot-password">Forgot Password</a>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
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
