// routes/statusRoutes.js
const express = require("express");
const User = require("../models/user");
const Status = require("../models/status");

const router = express.Router();

// ------------------- Create a Status -------------------
router.post("/", async (req, res) => {
  try {
    const { userId, userName, firstName, nickname, caption, media } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const newStatus = await Status.create({
      userId,
      userName,
      firstName,
      nickname,
      caption,
      media: media || [],
    });

    res.status(201).json(newStatus);
  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- Get All Statuses -------------------
router.get("/", async (_req, res) => {
  try {
    const statuses = await Status.find().sort({ createdAt: -1 }).lean();

    const clerkIds = statuses.map((s) => s.userId).filter(Boolean);

    const users = await User.find({ clerkId: { $in: clerkIds } }).lean();

    const userMap = {};
    users.forEach((u) => {
      if (u.clerkId) {
        userMap[u.clerkId] = {
          nickName: u.nickName || u.firstName || "Anonymous",
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          image: u.image ?? undefined,
        };
      }
    });

    const statusesWithUser = statuses.map((status) => ({
      ...status,
      user: userMap[status.userId] || {
        nickName: "Anonymous",
        firstName: "",
        lastName: "",
        image: undefined,
      },
    }));

    res.json(statusesWithUser);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- Like/Unlike a Status -------------------
router.post("/:statusId/like", async (req, res) => {
  try {
    const { statusId } = req.params;
    const { userId } = req.body;

    const status = await Status.findById(statusId);
    if (!status) return res.status(404).json({ message: "Status not found" });

    const index = status.likes.indexOf(userId);

    if (index === -1) {
      status.likes.push(userId);
    } else {
      status.likes.splice(index, 1);
    }

    await status.save();

    res.json({
      success: true,
      likes: status.likes.length,
      liked: index === -1,
    });
  } catch (err) {
    console.error("Error liking status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- Delete a Status -------------------
// ------------------- Delete a Status -------------------
router.delete("/:statusId", async (req, res) => {
  try {
    const { statusId } = req.params;
    const { userId } = req.body; // requester’s ID

    const status = await Status.findById(statusId);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    // Only allow the owner of the status to delete
    if (status.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this status" });
    }

    await status.deleteOne();

    res.json({ success: true, message: "Status deleted successfully" });
  } catch (err) {
    console.error("Error deleting status:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
