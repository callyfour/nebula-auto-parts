import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");

const NavRight = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Load user from localStorage (Google or normal login)
  const loadUserFromStorage = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      setUser(null);
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        return;
      } catch (err) {
        console.error("Invalid stored user JSON:", err);
        localStorage.removeItem("user");
      }
    }

    // fallback: fetch from backend if no stored user
    fetchUserFromAPI(token);
  };

  // ✅ Fetch user from API (for email/password login fallback)
  const fetchUserFromAPI = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    }
  };

  // ✅ Refresh on page change
  useEffect(() => {
    loadUserFromStorage();
  }, [location]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="navbar-right">
      {user ? (
        <div className="user-menu" ref={dropdownRef}>
          <button
            className="svg-btn login-btn"
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="10,0 50,0 50,40 40,50 0,50 0,10"
                fill="#1f1f1f"
              />
            </svg>
            <span className="icon-wrapper">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <i className="bx bxs-user"></i>
              )}
            </span>
            <span className="user-name">{user.name}</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown">
              <button
                className="dropdown-item"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          className="svg-btn login-btn"
          type="button"
          onClick={() => navigate("/login")}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="10,0 50,0 50,40 40,50 0,50 0,10" fill="#1f1f1f" />
          </svg>
          <span className="icon-wrapper">
            <i className="bx bxs-user"></i>
          </span>
        </button>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </div>
  );
};

export default NavRight;
