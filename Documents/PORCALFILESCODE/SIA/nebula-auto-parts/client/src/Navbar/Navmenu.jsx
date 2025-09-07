import { Link } from "react-router-dom";

const NavMenu = () => {
  return (
    <ul className="nav-menu">
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/shop">Shop Parts</Link>
      </li>
      <li>
        <Link to="/contact">Contact Us</Link>
      </li>
      <li>
        <Link to="/about">About Us</Link>
      </li>
      <li>
        <Link to="/gallery">Gallery</Link>
      </li>
      <li>
        <Link to="/cart">Cart</Link>
      </li>
    </ul>
  );
};

export default NavMenu;
