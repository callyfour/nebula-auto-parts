import "./Navbar.css";
import "../HomePage/Homepage.css";
import logo from "../assets/logo.png";
import NavMenu from "./Navmenu";
import NavRight from "./NavRight";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="" />
      </div>
      <NavMenu />
      <NavRight />
    </div>
  );
};

export default Navbar;
