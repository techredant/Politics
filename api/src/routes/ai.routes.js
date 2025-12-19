// src/routes/ai.routes.js
const express = require("express");
const { StreamChat } = require("stream-chat");
const OpenAI = require("openai");

const router = express.Router();

const streamClient = StreamChat.getInstance(
  process.env.STREAM_CHAT_KEY,
  process.env.STREAM_CHAT_SECRET
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/reply", async (req, res) => {
  try {
    const { channelId, text } = req.body;

    // 1️⃣ Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful political AI assistant." },
        { role: "user", content: text },
      ],
    });

    const aiReply = completion.choices[0].message.content;

    // 2️⃣ Send message as AI bot
    const channel = streamClient.channel("messaging", channelId);

    await channel.sendMessage({
      text: aiReply,
      user_id: "ai-bot",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("AI reply error:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;
