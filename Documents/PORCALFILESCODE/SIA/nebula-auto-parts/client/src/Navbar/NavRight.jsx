import { useNavigate } from "react-router-dom";
import { useState } from "react";

const NavRight = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      // go to /shop with search query
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(""); // clear input
    }
  };

  return (
    <div className="navbar-right">
      {/* Login button */}
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

      {/* Search bar with form so Enter works */}
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
