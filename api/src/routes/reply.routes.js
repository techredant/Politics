// Like a reply (when replies are embedded in Comment)
router.post("/:commentId/replies/:replyId/like", async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const { userId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const index = reply.likes.indexOf(userId);
    if (index === -1) {
      reply.likes.push(userId);
    } else {
      reply.likes.splice(index, 1);
    }

    await comment.save();

    res.json({
      success: true,
      likes: reply.likes.length,
      liked: index === -1,
    });
  } catch (err) {
    console.error("Error liking reply:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;