const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true }, // ✅ for Google login users
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // ✅ no longer required (Google users won’t have it)
  phone: { type: String },
  gender: { type: String, enum: ["Male", "Female"] },
  address: { type: String },
  profilePicture: { type: mongoose.Schema.Types.Mixed }, 
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema, "users");
