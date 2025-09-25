const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const { google } = require("googleapis");

const User = require("../../models/user");

const router = express.Router();

// ===== GRIDFS SETUP =====
let gfs;
const conn = mongoose.connection;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Multer Storage Engine (GridFS)
const storage = new GridFsStorage({
  url: process.env.MONGO_URI || "mongodb://localhost:27017/yourDB",
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
    };
  },
});
const upload = multer({ storage });

// ===== AUTH MIDDLEWARE =====
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ===== GOOGLE OAUTH SETUP =====
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // must match Google Console
);

// ===== REGISTER =====
router.post("/register", upload.single("profilePicture"), async (req, res) => {
  try {
    const { name, email, password, phone, gender, address } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      address,
      profilePicture: req.file ? req.file.filename : null,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        address: newUser.address,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        address: user.address,
        profilePicture: user.profilePicture || null,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===== FETCH PROFILE =====
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== UPDATE PROFILE =====
router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { name, email, phone, gender, address } = req.body;

      const updateData = { name, email, phone, gender, address };
      if (req.file) updateData.profilePicture = req.file.filename;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      ).select("-password");

      res.json(updatedUser);
    } catch (err) {
      console.error("❌ Profile update error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===== GET PROFILE PICTURE =====
router.get("/profile/picture/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ message: "File not found" });

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (err) {
    console.error("❌ Fetch picture error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== GOOGLE LOGIN ROUTES =====
router.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get Google profile
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.name,
        email: profile.email,
        profilePicture: profile.picture,
        role: "user",
      });
      await user.save();
    }

    // JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    if (process.env.FRONTEND_URL) {
      res.redirect(
        `${process.env.FRONTEND_URL}/auth-success?token=${token}&user=${encodeURIComponent(
          JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
          })
        )}`
      );
    } else {
      res.json({ success: true, token, user });
    }
  } catch (err) {
    console.error("❌ Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
});

module.exports = router;
