// src/routes/stream.routes.js
const express = require("express");
const { StreamChat } = require("stream-chat");
require("dotenv").config();

const router = express.Router();

const STREAM_KEY = process.env.STREAM_CHAT_KEY;
const STREAM_SECRET = process.env.STREAM_CHAT_SECRET;

const serverClient = StreamChat.getInstance(STREAM_KEY, STREAM_SECRET);

// router.post("/token", async (req, res) => {
//   try {
//     const { userId } = req.body;
//     if (!userId) return res.status(400).json({ error: "userId is required" });

//     const token = serverClient.createToken(userId);
//     res.json({ token });
//   } catch (error) {
//     console.error("Stream token error:", error);
//     res.status(500).json({ error: "Failed to create Stream token" });
//   }
// });

router.post("/token", async (req, res) => {
  try {
    const { userId, name, image } = req.body; // pass name & image from frontend

    if (!userId) return res.status(400).json({ error: "userId is required" });

    // Upsert the user in Stream
    await serverClient.upsertUser({
      id: userId,
      name: name || "Demo User",
      image: image || "https://placekitten.com/200/200",
    });

    // Generate token for the user
    const token = serverClient.createToken(userId);

    res.json({ token });
  } catch (error) {
    console.error("Stream token error:", error);
    res.status(500).json({ error: "Failed to create Stream token" });
  }
});


module.exports = router;
