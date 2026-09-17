const express = require("express");
const {
  applyForJob,
  getMyApplications,
  getMyApplicationById,
  getApplicationsForJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.post("/:jobId", protect, authorize("jobseeker"), applyForJob);
router.get("/my-applications", protect, authorize("jobseeker"), getMyApplications);
router.get("/my-applications/:id", protect, authorize("jobseeker"), getMyApplicationById);

router.get("/job/:jobId", protect, authorize("employer"), getApplicationsForJob);
router.put("/:id/status", protect, authorize("employer"), updateApplicationStatus);

module.exports = router;
