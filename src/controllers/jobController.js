const Job = require("../models/Job");
const { asyncHandler } = require("../middleware/errorHandler");

const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    companyName,
    description,
    location,
    employmentType,
    salaryRange,
    requiredSkills,
    experienceRequired,
    applicationDeadline,
  } = req.body;

  if (!title || !companyName || !description || !location || !employmentType) {
    res.status(400);
    throw new Error(
      "title, companyName, description, location and employmentType are required."
    );
  }

  const job = await Job.create({
    title,
    companyName,
    description,
    location,
    employmentType,
    salaryRange,
    requiredSkills,
    experienceRequired,
    applicationDeadline,
    employer: req.user._id,
  });

  res.status(201).json({ success: true, data: job });
});

const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: jobs.length, data: jobs });
});

const getAllJobs = asyncHandler(async (req, res) => {
  const { search, location, employmentType } = req.query;
  const filter = { status: "open" };

  if (search) filter.$text = { $search: search };
  if (location) filter.location = new RegExp(location, "i");
  if (employmentType) filter.employmentType = employmentType;

  const jobs = await Job.find(filter)
    .populate("employer", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: jobs.length, data: jobs });
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("employer", "name email");
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }
  res.status(200).json({ success: true, data: job });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  if (job.employer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only update your own job postings.");
  }

  const updatableFields = [
    "title",
    "companyName",
    "description",
    "location",
    "employmentType",
    "salaryRange",
    "requiredSkills",
    "experienceRequired",
    "applicationDeadline",
    "status",
  ];
  for (const field of updatableFields) {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  }

  await job.save();
  res.status(200).json({ success: true, data: job });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  if (job.employer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own job postings.");
  }

  await job.deleteOne();
  res.status(200).json({ success: true, message: "Job deleted successfully." });
});

module.exports = {
  createJob,
  getMyJobs,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
