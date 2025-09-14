import "./Navbar.css";
import "../HomePage/Homepage.css";
import logo from "../assets/logo.png";
import NavMenu from "./Navmenu";
import NavRight from "./NavRight";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      {/* Logo clickable → go home */}
      <div className="nav-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" />
      </div>

      {/* Middle Menu */}
      <NavMenu />

      {/* Right side (search, login, profile, logout, username) */}
      <NavRight />
    </div>
  );
};

export default Navbar;
