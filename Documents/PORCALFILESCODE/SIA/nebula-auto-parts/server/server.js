require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const path = require("path");
const { google } = require("googleapis");


const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);


// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- MongoDB Connection ---
let gridfsBucket;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    gridfsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "images",
    });
    console.log("✅ GridFS initialized");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Multer setup ---
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/* ======================
   🔹 SCHEMAS & MODELS
   ====================== */
const featuredItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
});
const FeaturedItem = mongoose.model("FeaturedItem", featuredItemSchema, "featuredItems");

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  description: String,
  price: Number,
  brand: String,
  image: String,
});
const Product = mongoose.model("Product", productSchema, "productItems");

const userSchema = new mongoose.Schema({
  googleId: { type: String }, // ✅ add this
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for Google users
  phone: String,
  gender: { type: String, enum: ["Male", "Female"] },
  address: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profilePicture: { type: String }, // ✅ store Google avatar URL or base64
});

const User = mongoose.model("User", userSchema, "users");

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: Number,
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
});
const CartItem = mongoose.model("CartItem", cartItemSchema, "cartItems");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ productId: Number, name: String, price: Number, quantity: Number }],
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema, "orders");

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  data: { type: String, required: true }, // base64
  contentType: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadDate: { type: Date, default: Date.now },
  size: Number,
  category: { type: String, default: "general" },
});
const Image = mongoose.model("Image", imageSchema, "images");

// --- AUTH MIDDLEWARE ---
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}



/* ======================
   🔹 ROUTES
   ====================== */


app.get("/api/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "openid",
      "profile",
      "email"
    ],
  });
  res.redirect(url);
});
 

// Google callback route
app.get("/api/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch Google user profile
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    // --- Fetch profile picture from Google and store in DB ---
    let imageDoc = null;
    if (profile.picture) {
      const axios = require("axios");
      const response = await axios.get(profile.picture, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      // Save into Image collection
      imageDoc = new Image({
        filename: `google-${profile.id}.jpg`,
        data: buffer,
        contentType: response.headers["content-type"] || "image/jpeg",
        uploadedBy: null, // Google account at creation (can update later)
        size: buffer.length,
        category: "profile",
      });
      await imageDoc.save();
    }

    // --- Check if user exists ---
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.name,
        email: profile.email,
        profilePicture: imageDoc ? imageDoc._id : null, // ✅ store ObjectId instead of URL
        role: "user",
      });
      await user.save();

      // Update image with userId as uploader
      if (imageDoc) {
        imageDoc.uploadedBy = user._id;
        await imageDoc.save();
      }
    }

    // --- Create JWT ---
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Redirect or JSON
    if (process.env.FRONTEND_URL) {
      res.redirect(
        `${process.env.FRONTEND_URL}/auth-success?token=${token}&user=${encodeURIComponent(
          JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture, // ✅ ObjectId now
          })
        )}`
      );
    } else {
      res.json({ success: true, token, user });
    }
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
});







// Admin middleware
function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  next();
}

// --- GET ALL USERS ---
app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("profilePicture", "-data");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DELETE USER ---
app.delete("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN STATS ---
app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    res.json({ users: usersCount, products: productsCount, orders: ordersCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
/* ======================
   🔹 AUTH ROUTES (Optimized)
   ====================== */

// --- REGISTER ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, gender, address, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    // Convert email to lowercase for consistent search
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // Hash password (rounds can be 8 for dev/testing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      gender,
      address,
      role: role || "user",
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return minimal user data
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// --- LOGIN ---
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

    const normalizedEmail = email.trim().toLowerCase();

    // Direct indexed lookup (fast)
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return minimal user data
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// --- UPDATE USER (admin only) ---
app.put(
  "/api/admin/user/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, gender, address, role } = req.body;

      const updateData = { name, email, phone, gender, address, role };

      // If a profile picture file is uploaded
      if (req.file) {
        const img = new Image({
          filename: req.file.originalname,
          data: req.file.buffer.toString("base64"),
          contentType: req.file.mimetype,
          uploadedBy: req.user.id, // admin is uploading
          size: req.file.size,
          category: "profile",
        });
        await img.save();
        updateData.profilePicture = img._id;
      }

      // Ensure email uniqueness
      if (email) {
        const exists = await User.findOne({ email, _id: { $ne: id } });
        if (exists) return res.status(400).json({ message: "Email already in use" });
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select("-password").populate("profilePicture", "-data");

      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update user" });
    }
  }
);

/* ======================
   🔹 PROFILE ROUTES (with profile picture handling)
   ====================== */

/**
 * GET profile
 * returns user data and populates profilePicture (metadata only)
 */
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("profilePicture", "-data"); // include image metadata but not large base64
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT profile
 * Accepts multipart/form-data with optional 'profilePicture' file OR JSON body.
 * If a file is included, it will be saved into Image collection (base64) and linked.
 */
app.put("/api/user/profile", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    const { name, email, phone, gender, address } = req.body;

    // Email uniqueness check
    if (email) {
      const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    const updateData = { name, email, phone, gender, address };

    // If a file was uploaded, create an Image document and link it
    if (req.file) {
      const img = new Image({
        filename: req.file.originalname,
        data: req.file.buffer.toString("base64"),
        contentType: req.file.mimetype,
        uploadedBy: req.user.id,
        size: req.file.size,
        category: req.body.category || "profile",
      });
      await img.save();
      updateData.profilePicture = img._id;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true })
      .select("-password")
      .populate("profilePicture", "-data");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST profile picture (upload and set as user's profilePicture)
 * Accepts multipart/form-data with 'profilePicture' field.
 */
app.post("/api/profile-picture", authMiddleware, upload.single("profilePicture"), async (req, res) => {
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
 * GET profile picture by ObjectId
 */
app.get("/api/profile-picture/:id", async (req, res) => {
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
 * PUT profile picture (set profilePicture by existing imageId)
 * Body: { imageId }
 */
app.put("/api/profile-picture", authMiddleware, async (req, res) => {
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
 * DELETE profile picture by ObjectId
 */
app.delete("/api/profile-picture/:id", authMiddleware, async (req, res) => {
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

/* ======================
   🔹 PASSWORD ROUTE
   ====================== */
app.put("/api/user/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   🔹 PRODUCTS, FEATURED, SEARCH
   ====================== */
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get("/api/products/:id", async (req, res) => {
  const productId = Number(req.params.id);
  const product = await Product.findOne({ id: productId });
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  const products = await Product.find({
    $or: [
      { name: new RegExp(q, "i") },
      { brand: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
    ],
  });
  res.json(products);
});

app.get("/api/featured-items", async (req, res) => {
  const items = await FeaturedItem.find();
  res.json(items);
});

/* ======================
   🔹 CART
   ====================== */
app.get("/api/cart", authMiddleware, async (req, res) => {
  const items = await CartItem.find({ userId: req.user.id });
  res.json(items);
});

app.post("/api/cart", authMiddleware, async (req, res) => {
  const { productId, name, price, image, quantity } = req.body;
  let item = await CartItem.findOne({ userId: req.user.id, productId });
  const qty = quantity && Number(quantity) > 0 ? Number(quantity) : 1;
  if (item) {
    item.quantity = (item.quantity || 0) + qty;
  } else {
    item = new CartItem({
      userId: req.user.id,
      productId,
      name,
      price,
      image,
      quantity: qty,
    });
  }
  await item.save();
  res.json(item);
});

app.delete("/api/cart/:id", authMiddleware, async (req, res) => {
  await CartItem.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ======================
   🔹 ORDERS
   ====================== */
app.post("/api/orders/checkout", authMiddleware, async (req, res) => {
  const cartItems = await CartItem.find({ userId: req.user.id });
  if (!cartItems.length) return res.status(400).json({ message: "Cart empty" });

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = new Order({
    userId: req.user.id,
    items: cartItems.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    totalPrice,
  });
  await order.save();
  await CartItem.deleteMany({ userId: req.user.id });

  res.json({ success: true, order });
});

app.get("/api/orders", authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id });
  res.json(orders);
});

/* ======================
   🔹 BASE64 IMAGE ROUTES (existing)
   ====================== */
app.post("/api/upload/base64", authMiddleware, async (req, res) => {
  try {
    const { filename, data, contentType, category } = req.body;
    if (!data || !contentType) return res.status(400).json({ message: "Invalid data" });

    let base = data;
    const prefixMatch = data.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (prefixMatch) {
      base = prefixMatch[2];
    }

    const image = new Image({
      filename: filename || `upload-${Date.now()}`,
      data: base,
      contentType,
      uploadedBy: req.user.id,
      size: Buffer.from(base, "base64").length,
      category: category || "general",
    });
    await image.save();

    res.json({ success: true, imageId: image._id });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

app.get("/api/images", authMiddleware, async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { uploadedBy: req.user.id };
  const images = await Image.find(filter).select("-data");
  res.json(images);
});

app.get("/api/images/:id", authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Not found" });
    if (req.user.role !== "admin" && image.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    res.set("Content-Type", image.contentType);
    res.send(Buffer.from(image.data, "base64"));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/images/:id", authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Not found" });
    if (req.user.role !== "admin" && image.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await image.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   🔹 GRIDFS IMAGE ROUTES (existing, guarded)
   ====================== */
app.post("/api/upload/gridfs", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!gridfsBucket) {
      return res.status(500).json({ message: "GridFS not initialized yet" });
    }
    if (!req.file) return res.status(400).json({ message: "No image file provided" });

    const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
      metadata: {
        contentType: req.file.mimetype,
        uploadedBy: req.user.id,
        uploadDate: new Date(),
        category: req.body.category || "general",
      },
    });

    uploadStream.on("finish", () => {
      res.json({
        success: true,
        message: "Image uploaded to GridFS",
        fileId: uploadStream.id,
        url: `/api/image/gridfs/${uploadStream.id}`,
      });
    });

    uploadStream.on("error", (err) => {
      res.status(500).json({ message: "Upload failed" });
    });

    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/image/gridfs/:id", async (req, res) => {
  try {
    if (!gridfsBucket) {
      return res.status(500).json({ message: "GridFS not initialized yet" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const fileInfo = await gridfsBucket.find({ _id: fileId }).toArray();
    if (!fileInfo.length) return res.status(404).json({ message: "Not found" });

    res.set("Content-Type", fileInfo[0].metadata.contentType || "application/octet-stream");
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
    downloadStream.on("error", (err) => {
      res.status(500).json({ message: "Download failed" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


/* ======================
   🔹 START SERVER
   ====================== */
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);