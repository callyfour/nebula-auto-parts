import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token); // ✅ save token
      navigate("/profile"); // redirect to profile
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
};

export default GoogleCallback;
