const express = require("express");
const { StreamChat } = require("stream-chat");
const OpenAI = require("openai");

require("dotenv").config();

const router = express.Router();

const STREAM_KEY = process.env.STREAM_CHAT_KEY;
const STREAM_SECRET = process.env.STREAM_CHAT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const streamClient = StreamChat.getInstance(STREAM_KEY, STREAM_SECRET);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 🧠 AI Chat endpoint
router.post("/reply", async (req, res) => {
  try {
    const { channelId, userId, text } = req.body;

    if (!channelId || !userId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Fetch the Stream channel
    const channel = streamClient.channel("messaging", channelId);
    await channel.watch();

    // 🧩 Ask OpenAI for a reply
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + capable
      messages: [
        {
          role: "system",
          content:
            "You are a helpful and friendly assistant inside a social app chat. Keep responses short, natural, and conversational.",
        },
        { role: "user", content: text },
      ],
    });

    const reply = completion.choices[0].message.content?.trim();

    // 📨 Send the AI’s message to the same Stream channel
    await channel.sendMessage({
      text: reply || "🤖 I couldn't think of a reply right now!",
      user_id: "ai-bot",
    });

    res.json({ success: true, reply });
  } catch (error) {
    console.error("❌ AI Chat Error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

module.exports = router;
