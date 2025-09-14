import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");

const NavRight = () => {
  const navigate = useNavigate();
  const location = useLocation(); // detect page changes
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Fetch user from database
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
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
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    }
  };

  // Fetch user whenever location changes (e.g., after profile update)
  useEffect(() => {
    fetchUser();
  }, [location]);

  // Close dropdown if clicked outside
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
              <i className="bx bxs-user"></i>
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
