import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; // ✅ hash router
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx"; // ✅ Adjust path if your folder differs (e.g., "../contexts/AuthContext")

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        {" "}
        {/* ✅ This fixes the error – wraps the entire app */}
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
