// ProfilePage.jsx
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

  // Fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setForm(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    alert("Profile updated!");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
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
