require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./server/server");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Hello from Broadcast API"));

// ✅ Socket.IO handling
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Routes
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes")(io); // pass io
const commentRoutes = require("./routes/comment.routes");
const statusRoutes = require("./routes/status.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const verifyRoutes = require("./routes/verify.routes");
const streamRoutes = require("./routes/stream.routes");
const stripeRoutes = require("./routes/stripe.routes");
const newsRoutes = require("./routes/news.routes");

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/statuses", statusRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", verifyRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/news", newsRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message });
});

// Start server
const startServer = async () => {
  try {
    await connectDB(); // ONLY this one — removed duplicate connect

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
