import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    profilePicture: null, // store profile picture object from backend
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [profileExists, setProfileExists] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");
  const navigate = useNavigate();

  // Move fetchProfile outside useEffect so we can call it after save
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        return navigate("/login");
      }

      if (res.status === 404) {
        setProfileExists(false);
        setMessage("Profile not found. You can create your profile.");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Profile fetch failed:", res.status, text);
        setMessage("Failed to load profile. Please refresh the page.");
        return;
      }

      const data = await res.json();
      console.log("Profile data received:", data); // Debug log

      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        gender: data.gender || "",
        address: data.address || "",
        profilePicture: data.profilePicture || null, // This is the populated image object
      });
      setProfileExists(true);
      setMessage(null);
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      setMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [API_URL, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("gender", form.gender);
      formData.append("address", form.address);
      formData.append("category", "profile"); // Add category for profile pictures

      if (imageFile) {
        formData.append("profilePicture", imageFile);
      }

      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        return navigate("/login");
      }

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("❌ Profile update failed:", res.status, errorData);
        setMessage(
          `Failed to update profile: ${errorData.message || "Unknown error"}`
        );
        return;
      }

      // Instead of using returned data, fetch profile again to ensure fresh data
      await fetchProfile();

      // Clear the file input and preview
      setImageFile(null);
      setPreview(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      setMessage("✅ Profile updated successfully!");

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      setMessage("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Function to get profile picture URL
  const getProfilePictureUrl = () => {
    if (preview) {
      return preview; // Show preview if user selected a new file
    }

    if (form.profilePicture && form.profilePicture._id) {
      return `${API_URL}/api/images/${form.profilePicture._id}`;
    }

    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <h3>Menu</h3>
        <button className="active">Profile</button>
        <button>Settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          {getProfilePictureUrl() ? (
            <img
              src={getProfilePictureUrl()}
              alt="Profile"
              onError={(e) => {
                console.error("Failed to load profile image");
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : (
            <div className="placeholder-avatar">
              {form.name ? form.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          {getProfilePictureUrl() && (
            <div className="placeholder-avatar" style={{ display: "none" }}>
              {form.name ? form.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>

        <div className="file-input-container">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={saving}
            id="profile-picture-input"
          />
          <label htmlFor="profile-picture-input" className="file-input-label">
            {form.profilePicture ? "Change Picture" : "Upload Picture"}
          </label>
        </div>

        <div className="profile-name">{form.name || "Your Name"}</div>
        <div className="profile-role">User</div>

        {message && (
          <div
            className={`profile-message ${
              message.includes("✅") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        {!profileExists && (
          <p className="profile-message info">
            You currently do not have a profile. Fill out the form below to
            create one.
          </p>
        )}

        {/* Form fields */}
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={saving}
              type="text"
              placeholder="Enter your name"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={saving}
              type="email"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={saving}
              type="tel"
              placeholder="Enter your phone number"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Gender</label>
            <div className="gender-options">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={form.gender === "Male"}
                  onChange={handleChange}
                  disabled={saving}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={form.gender === "Female"}
                  onChange={handleChange}
                  disabled={saving}
                />
                Female
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={saving}
            type="text"
            placeholder="Enter your address"
          />
        </div>

        <div className="btn-container">
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving
              ? "Saving..."
              : profileExists
              ? "Save Changes"
              : "Create Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
