import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
  });
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

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
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
      });
      setProfileExists(true);
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      setMessage("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {message && <p className="profile-message">{message}</p>}

      {!profileExists && (
        <p className="profile-message">
          You currently do not have a profile. Fill out the form below to create
          one.
        </p>
      )}

      <div className="profile-card">
        <label>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={saving}
        />

        <label>Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled={saving}
        />

        <label>Phone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          disabled={saving}
        />

        <label>Gender</label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          disabled={saving}
        >
          <option value="">Select...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <label>Address</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          disabled={saving}
        />

        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : profileExists ? "Save" : "Create Profile"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
