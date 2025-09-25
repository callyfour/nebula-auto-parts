import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        // server should redirect like: /auth-success?token=...&user=...
        const token = params.get("token");
        const userParam = params.get("user");

        if (!token) {
          setMessage("No token returned. Sign-in failed.");
          // optional: try to call your backend to exchange code for token, etc.
          return;
        }

        // store token
        localStorage.setItem("token", token);

        // if server provided user payload, decode + store
        if (userParam) {
          try {
            const parsed = JSON.parse(decodeURIComponent(userParam));
            localStorage.setItem("user", JSON.stringify(parsed));
          } catch (err) {
            // if parsing fails, we'll fetch profile from API below
            console.warn(
              "Could not parse user param, will request profile:",
              err
            );
          }
        }

        // if no user in localStorage, fetch profile using token
        if (!localStorage.getItem("user")) {
          try {
            const res = await fetch(`${API_URL}/api/user/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const profile = await res.json();
              localStorage.setItem("user", JSON.stringify(profile));
            } else {
              console.warn("Profile fetch returned", res.status);
            }
          } catch (err) {
            console.warn("Error fetching profile after OAuth:", err);
          }
        }

        // success: redirect to home or profile
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Auth success handler error:", err);
        setMessage("Sign-in failed");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>{message}</h2>
      <p>
        If you are not redirected automatically,{" "}
        <button onClick={() => (window.location.href = "/")}>go home</button>
      </p>
    </div>
  );
}
