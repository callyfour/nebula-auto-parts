const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = mongoose.model("User");
const Image = mongoose.model("Image");

// Multer setup (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- JWT Auth Middleware ---
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * GET /api/user/profile
 * Fetch logged-in user's profile
 */
router.get("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Profile not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * PUT /api/user/profile
 * Update profile details (with optional picture upload)
 */
router.put(
  "/api/user/profile",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { name, email, phone, gender, address } = req.body;

      // Ensure unique email (if changed)
      if (email) {
        const exists = await User.findOne({
          email,
          _id: { $ne: req.user.id },
        });
        if (exists) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      const updateData = { name, email, phone, gender, address };

      // If file uploaded, save new image
      if (req.file) {
        const img = new Image({
          filename: req.file.originalname,
          data: req.file.buffer.toString("base64"),
          contentType: req.file.mimetype,
          uploadedBy: req.user.id,
          size: req.file.size,
          category: "profile",
        });
        await img.save();
        updateData.profilePicture = img._id;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      ).select("-password");

      res.json(updatedUser);
    } catch (err) {
      console.error("❌ Profile update error:", err);
      res.status(500).json({ message: err.message || "Failed to update profile" });
    }
  }
);

/**
 * POST /api/profile-picture
 * Upload a new profile picture only
 */
router.post(
  "/api/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const img = new Image({
        filename: req.file.originalname,
        data: req.file.buffer.toString("base64"),
        contentType: req.file.mimetype,
        uploadedBy: req.user.id,
        size: req.file.size,
        category: "profile",
      });
      await img.save();

      await User.findByIdAndUpdate(req.user.id, { profilePicture: img._id });
      res.json({ success: true, imageId: img._id });
    } catch (err) {
      console.error("❌ Upload profile picture error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/profile-picture/:id
 */
router.get("/api/profile-picture/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    res.set("Content-Type", image.contentType);
    res.send(Buffer.from(image.data, "base64"));
  } catch (err) {
    console.error("❌ Get picture error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/profile-picture
 */
router.put("/api/profile-picture", authMiddleware, async (req, res) => {
  try {
    const { imageId } = req.body;
    if (!imageId) return res.status(400).json({ message: "Image ID required" });

    const image = await Image.findById(imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });
    if (image.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await User.findByIdAndUpdate(req.user.id, { profilePicture: imageId });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Set picture error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/profile-picture/:id
 */
router.delete("/api/profile-picture/:id", authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    if (image.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await image.deleteOne();
    await User.updateMany({ profilePicture: req.params.id }, { $unset: { profilePicture: "" } });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete picture error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
