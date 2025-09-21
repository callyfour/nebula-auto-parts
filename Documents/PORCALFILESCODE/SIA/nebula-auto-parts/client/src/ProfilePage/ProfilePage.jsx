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
    profilePicture: "", // store profile picture URL from backend
  });
  const [imageFile, setImageFile] = useState(null); // new state for file
  const [preview, setPreview] = useState(null); // preview before upload
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [profileExists, setProfileExists] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");
  const navigate = useNavigate();

  useEffect(() => {
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
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          address: data.address || "",
          profilePicture: data.profilePicture || "", // load picture URL
        });
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setMessage("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
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
      if (imageFile) {
        formData.append("profilePicture", imageFile);
      }

      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // don’t set Content-Type, browser handles it
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        return navigate("/login");
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Profile update failed:", res.status, text);
        setMessage("Failed to update profile.");
        return;
      }

      const updatedData = await res.json();
      setForm({
        name: updatedData.name || "",
        email: updatedData.email || "",
        phone: updatedData.phone || "",
        gender: updatedData.gender || "",
        address: updatedData.address || "",
        profilePicture: updatedData.profilePicture || "",
      });
      setImageFile(null);
      setPreview(null);
      setProfileExists(true);
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      setMessage("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
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
        <button>Logout</button>
      </div>

      {/* Main Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          {preview ? (
            <img src={preview} alt="Preview" />
          ) : form.profilePicture ? (
            <img src={`${API_URL}/${form.profilePicture}`} alt="Profile" />
          ) : (
            <div className="placeholder-avatar">No Image</div>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <div className="profile-name">{form.name || "Your Name"}</div>
        <div className="profile-role">User Role</div>

        {message && <p className="profile-message">{message}</p>}
        {!profileExists && (
          <p className="profile-message">
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
