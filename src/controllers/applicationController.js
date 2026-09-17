const Application = require("../models/Application");
const Job = require("../models/Job");
const { asyncHandler } = require("../middleware/errorHandler");

const applyForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  if (job.status !== "open") {
    res.status(400);
    throw new Error("This job is no longer accepting applications.");
  }

  const alreadyApplied = await Application.findOne({
    job: jobId,
    applicant: req.user._id,
  });
  if (alreadyApplied) {
    res.status(400);
    throw new Error("You have already applied for this job.");
  }

  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    coverLetter,
    applicantSnapshot: {
      name: req.user.name,
      email: req.user.email,
      skills: req.user.skills,
      experience: req.user.experience,
    },
  });

  res.status(201).json({ success: true, data: application });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("job", "title companyName location status")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: applications.length, data: applications });
});

const getMyApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate(
    "job",
    "title companyName location status"
  );

  if (!application) {
    res.status(404);
    throw new Error("Application not found.");
  }

  if (application.applicant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only view your own applications.");
  }

  res.status(200).json({ success: true, data: application });
});

const getApplicationsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  if (job.employer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only view applications for your own jobs.");
  }

  const applications = await Application.find({ job: req.params.jobId }).sort({
    createdAt: -1,
  });

  res.status(200).json({ success: true, count: applications.length, data: applications });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const application = await Application.findById(req.params.id).populate("job");
  if (!application) {
    res.status(404);
    throw new Error("Application not found.");
  }

  if (application.job.employer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only manage applications for your own jobs.");
  }

  application.status = status;
  await application.save();

  res.status(200).json({ success: true, data: application });
});

module.exports = {
  applyForJob,
  getMyApplications,
  getMyApplicationById,
  getApplicationsForJob,
  updateApplicationStatus,
};
