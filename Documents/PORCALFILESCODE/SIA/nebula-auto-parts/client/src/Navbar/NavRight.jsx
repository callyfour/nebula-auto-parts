import { useNavigate } from "react-router-dom";

const NavRight = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar-right">
      <button
        className="svg-btn login-btn"
        type="button"
        onClick={() => navigate("/login")} // 👈 redirect to /login
      >
        {/* SVG background */}
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="10,0 50,0 50,40 40,50 0,50 0,10" fill="#1f1f1f" />
        </svg>

        {/* Icon centered on top of SVG */}
        <span className="icon-wrapper">
          <i className="bx bxs-user"></i>
        </span>
      </button>

      {/* Search Bar */}
      <input type="text" placeholder="Search..." className="search-bar" />
    </div>
  );
};

export default NavRight;
