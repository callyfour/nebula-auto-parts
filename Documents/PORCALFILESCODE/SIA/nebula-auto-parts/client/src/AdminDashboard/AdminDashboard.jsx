import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");
  const navigate = useNavigate();

  // Fetch users and stats
  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      try {
        // Users
        const resUsers = await fetch(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resUsers.status === 401) return navigate("/login");
        const usersData = await resUsers.json();
        setUsers(usersData);

        // Stats
        const resStats = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await resStats.json();
        setStats(statsData);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [API_URL, navigate]);

  // Select a user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEditMode(false);
    setMessage(null);
    setProfileFile(null);
  };

  const handleEditUser = () => setEditMode(true);

  const handleChange = (e) => {
    setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setProfileFile(e.target.files[0]);
  };

  // Save user
  const handleSaveUser = async () => {
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      let formData = new FormData();
      formData.append("name", selectedUser.name);
      formData.append("email", selectedUser.email);
      formData.append("role", selectedUser.role);
      formData.append("phone", selectedUser.phone || "");
      formData.append("address", selectedUser.address || "");
      if (profileFile) formData.append("profilePicture", profileFile);

      const res = await fetch(`${API_URL}/api/admin/user/${selectedUser._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Update failed:", errText);
        throw new Error("Failed to update user");
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u))
      );
      setSelectedUser(updated);
      setEditMode(false);
      setProfileFile(null);
      setMessage("✅ User updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not update user.");
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setSelectedUser(null);
      setMessage("✅ User deleted.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to delete user.");
    }
  };

  // Profile picture URL
  const getProfilePictureUrl = (user) => {
    if (profileFile) return URL.createObjectURL(profileFile);
    if (user.profilePicture && user.profilePicture.$oid)
      return `${API_URL}/api/profile-picture/${user.profilePicture.$oid}`;
    return null;
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (profileFile) URL.revokeObjectURL(profileFile);
    };
  }, [profileFile]);

  if (loading)
    return (
      <div className="admin-container">
        <p>Loading dashboard...</p>
      </div>
    );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h3>Admin Menu</h3>
        <button className="active">Dashboard</button>
        <button>Products</button>
        <button>Orders</button>
        <button>Logout</button>
        <div className="admin-stats">
          <p>
            <strong>Products:</strong> {stats.products}
          </p>
          <p>
            <strong>Orders:</strong> {stats.orders}
          </p>
          <p>
            <strong>Users:</strong> {users.length}
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        <h2>Users</h2>
        <div className="user-list">
          {users.map((user) => (
            <div
              key={user._id}
              className={`user-item ${
                selectedUser && selectedUser._id === user._id ? "selected" : ""
              }`}
              onClick={() => handleSelectUser(user)}
            >
              <div className="user-avatar">
                {getProfilePictureUrl(user) ? (
                  <img
                    src={getProfilePictureUrl(user)}
                    alt={user.name}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="user-placeholder">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <div>
                <strong>{user.name}</strong>
                <div className="user-email">{user.email}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit user card */}
        {selectedUser && (
          <div className="edit-user-card">
            <h3>Edit User</h3>
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label>Name</label>
                <input
                  name="name"
                  value={selectedUser.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  type="text"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Email</label>
                <input
                  name="email"
                  value={selectedUser.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  type="email"
                />
              </div>
            </div>
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label>Role</label>
                <select
                  name="role"
                  value={selectedUser.role}
                  onChange={handleChange}
                  disabled={!editMode}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Phone</label>
                <input
                  name="phone"
                  value={selectedUser.phone || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                  type="tel"
                />
              </div>
            </div>
            <div>
              <label>Address</label>
              <input
                name="address"
                value={selectedUser.address || ""}
                onChange={handleChange}
                disabled={!editMode}
                type="text"
              />
            </div>
            {editMode && (
              <div>
                <label>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
            <div className="btn-container">
              {editMode ? (
                <button className="btn-save" onClick={handleSaveUser}>
                  Save Changes
                </button>
              ) : (
                <button className="btn-edit" onClick={handleEditUser}>
                  Edit
                </button>
              )}
              <button
                className="btn-delete"
                onClick={() => handleDeleteUser(selectedUser._id)}
              >
                Delete User
              </button>
            </div>
            {message && (
              <div
                className={`admin-message ${
                  message.includes("✅") ? "success" : "error"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
