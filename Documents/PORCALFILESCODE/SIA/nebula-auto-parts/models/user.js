const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will be hashed
  phone: { type: String },
  gender: { type: String, enum: ["Male", "Female"] },
  address: { type: String },
  profilePicture: { type: String, default: "" }, // ✅ new field
});

module.exports = mongoose.model("User", userSchema, "users");
