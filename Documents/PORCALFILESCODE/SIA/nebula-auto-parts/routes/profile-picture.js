const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const router = express.Router();

const User = mongoose.model("User");
const Image = mongoose.model("Image");

// Multer setup for in-memory file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Middleware for JWT Auth ---
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = require("jsonwebtoken").verify(token, process.env.JWT_SECRET || "fallback_secret");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * POST /api/profile-picture
 * Upload a new profile picture and set as user's profilePicture.
 * Accepts multipart/form-data with 'profilePicture' field.
 */
router.post("/api/profile-picture", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Create and save new image
    const img = new Image({
      filename: req.file.originalname,
      data: req.file.buffer.toString("base64"),
      contentType: req.file.mimetype,
      uploadedBy: req.user.id,
      size: req.file.size,
      category: "profile",
    });
    await img.save();

    // Update user's profilePicture reference
    await User.findByIdAndUpdate(req.user.id, { profilePicture: img._id });

    res.json({ success: true, imageId: img._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/profile-picture/:id
 * Serve the profile picture image by its ObjectId.
 */
router.get("/api/profile-picture/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    res.set("Content-Type", image.contentType);
    res.send(Buffer.from(image.data, "base64"));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/profile-picture
 * Set the user's profilePicture by providing an existing image ObjectId.
 * Body: { imageId }
 */
router.put("/api/profile-picture", authMiddleware, async (req, res) => {
  try {
    const { imageId } = req.body;
    if (!imageId) return res.status(400).json({ message: "Image ID required" });

    // Ensure image exists and belongs to user
    const image = await Image.findById(imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });
    if (image.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await User.findByIdAndUpdate(req.user.id, { profilePicture: imageId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/profile-picture/:id
 * Delete an image by ObjectId. Only owner or admin should be allowed.
 */
router.delete("/api/profile-picture/:id", authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Only allow owner or admin
    if (image.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await image.deleteOne();

    // Optionally, unset profilePicture if current
    await User.updateMany({ profilePicture: req.params.id }, { $unset: { profilePicture: "" } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;