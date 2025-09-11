import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import "./Login.css";
import promoPhoto from "../assets/promo-photo.png";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token); // ✅ store token
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Registration successful!");
        navigate("/"); // redirect home
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <Navbar />

      <div className="login-wrapper">
        {/* Left - Register Form */}
        <div className="login-form">
          <h2>Create Account</h2>
          <p className="subtitle">Fill in your details to register</p>

          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="btn">
              Sign Up
            </button>

            <p className="signup">
              Already have an account? <Link to="/login">Sign in</Link>
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
