const User = require("../models/User");
const Job = require("../models/Job");
const { asyncHandler } = require("../middleware/errorHandler");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.status(200).json({ success: true, data: user });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["active", "suspended"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'active' or 'suspended'.");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.status(200).json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  await user.deleteOne();
  res.status(200).json({ success: true, message: "User deleted successfully." });
});

const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate("employer", "name email").sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: jobs.length, data: jobs });
});

const getJobByIdAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("employer", "name email");
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }
  res.status(200).json({ success: true, data: job });
});

const deleteJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }
  await job.deleteOne();
  res.status(200).json({ success: true, message: "Job removed successfully." });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllJobsAdmin,
  getJobByIdAdmin,
  deleteJobAdmin,
};
