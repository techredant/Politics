// routes/verify.routes.js
const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();
const User = require("../models/user");

const router = express.Router();

// ✅ Send verification email
router.post("/verify", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // create token
    const token = crypto.randomBytes(32).toString("hex");
    user.verifyToken = token;
    // user.verifyTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    user.verifyTokenExpiry = undefined;

    await user.save();

    // email transport (sender = your fixed Gmail account)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ✅ your Gmail
        pass: process.env.EMAIL_PASS, // ✅ app password
      },
    });

    const link = `http://192.168.100.4:3000/api/verify/${token}`;

    await transporter.sendMail({
      from: `"BroadCast Verification" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // ✅ always sent to your admin inbox
      replyTo: email, // ✅ reply directly to user
      subject: "New Verification Request",
      html: `
        <h2>New User Verification Request</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p>Click below to verify this user:</p>
        <a href="${link}" 
           style="display:inline-block;background:#3300FF;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
           ✅ Verify Account
        </a>
      `,
    });

    res.json({ message: "Verification request sent to admin inbox" });
  } catch (err) {
    console.error("Error in /verify:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Verify account
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verifyToken: req.params.token,
      // verifyTokenExpiry: { $gt: Date.now() }, // enable if using expiry
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    console.error("Error in /verify/:token:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
