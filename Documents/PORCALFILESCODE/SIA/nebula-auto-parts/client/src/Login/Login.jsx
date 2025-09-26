import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import "./Login.css";
import { useAuth } from "../contexts/AuthContext.jsx";
import promoPhoto from "../assets/promo-photo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Inside component:
  const { login } = useAuth();
  // In handleSubmit (after success):
  login(data.token, data.user);
  if (data.user.role === "admin") {
    navigate("/admin", { replace: true });
  } else {
    navigate("/", { replace: true });
  }
  // In useEffect (Google callback, after parsing):
  login(token, parsedUser);
  if (parsedUser.role === "admin") {
    navigate("/admin", { replace: true });
  } else {
    navigate("/", { replace: true });
  }
  // ✅ Handle Google callback from backend (/auth-success redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userEncoded = params.get("user"); // This is URL-encoded JSON string from backend

    if (token && userEncoded) {
      try {
        // ✅ Decode and parse the user data (backend uses encodeURIComponent(JSON.stringify()))
        const userDecoded = decodeURIComponent(userEncoded);
        const parsedUser = JSON.parse(userDecoded);

        // ✅ Store parsed data in localStorage (token as string, user as JSON string)
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(parsedUser));

        console.log("Google login saved:", parsedUser); // Debug log (remove in prod)

        // Redirect based on role
        if (parsedUser.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Failed to parse Google user data:", err);
        setError("Failed to process Google login. Please try again.");
        // Optionally clear URL params: window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [location, navigate]);

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

        console.log("Regular login saved:", data.user); // Debug log (remove in prod)

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
    // ✅ Optional: Store current path to redirect back after Google login (if needed)
    const returnTo = location.pathname + location.search;
    const googleUrl = `${
      import.meta.env.VITE_API_BASE
    }/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.href = googleUrl;
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
                <input type="checkbox" id="keepLoggedIn" /> Keep me logged in
              </label>
              <a href="/forgot-password">Forgot Password</a>{" "}
              {/* ✅ Made it a real link */}
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* ✅ Google Login Button */}
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
