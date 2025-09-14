import { useEffect, useState } from "react";

const ProfilePage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // For success/error messages

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text(); // Get HTML or text if error
          console.error("❌ Profile fetch failed:", res.status, text);
          setMessage("Failed to load profile. Please try again.");
          return;
        }

        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setMessage("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Profile update failed:", res.status, text);
        setMessage("Failed to update profile.");
        return;
      }

      const updatedData = await res.json();
      setForm(updatedData);
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      setMessage("An error occurred. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {message && <p className="profile-message">{message}</p>}
      <div className="profile-card">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">Select...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <label>Address</label>
        <input name="address" value={form.address} onChange={handleChange} />

        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default ProfilePage;
