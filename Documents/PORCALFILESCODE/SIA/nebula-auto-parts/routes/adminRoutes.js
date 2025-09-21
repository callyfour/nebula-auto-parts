const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = mongoose.model("User");
const Product = mongoose.model("Product");
const Order = mongoose.model("Order");

// --- Admin Auth Middleware ---
function adminMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
    req.user = jwt.verify(token, JWT_SECRET);
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * GET /api/admin/users
 * Returns all users (admin only)
 */
router.get("/api/admin/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/admin/stats
 * Returns product/order/user counts
 */
router.get("/api/admin/stats", adminMiddleware, async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const users = await User.countDocuments();
    res.json({ products, orders, users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/admin/user/:id
 * Update a user's details (admin only)
 */
router.put("/api/admin/user/:id", adminMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.password; // Don't allow password update here
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/admin/user/:id
 * Delete a user (admin only)
 */
router.delete("/api/admin/user/:id", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;