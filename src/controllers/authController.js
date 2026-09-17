const User = require("../models/User");
const generateTokenAndSetCookie = require("../utils/generateToken");
const { asyncHandler } = require("../middleware/errorHandler");
const { validationResult } = require("express-validator");

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(", "));
  }

  const { name, email, password, role, skills, experience, education } = req.body;
  const safeRole = role === "employer" ? "employer" : "jobseeker";

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    skills: skills || [],
    experience: experience || "",
    education: education || [],
  });

  generateTokenAndSetCookie(res, user._id);

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password.");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (user.status === "suspended") {
    res.status(403);
    throw new Error("Your account has been suspended.");
  }

  generateTokenAndSetCookie(res, user._id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

const getMyProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "skills", "experience", "education"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

module.exports = { register, login, logout, getMyProfile, updateMyProfile };
