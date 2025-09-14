import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const NavRight = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null); // track logged-in user
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if token & user exist in localStorage
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user data in localStorage", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
          {/* User button with icon + name */}
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
            <span className="user-name">Hi, {user.username || user.name}</span>
          </button>

          {/* Dropdown menu */}
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
        // If not logged in, show login
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
