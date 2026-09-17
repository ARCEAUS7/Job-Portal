const express = require("express");
const {
  createJob,
  getMyJobs,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.get("/", getAllJobs);

router.get("/my-jobs", protect, authorize("employer"), getMyJobs);
router.post("/", protect, authorize("employer"), createJob);

router.get("/:id", getJobById);

router.put("/:id", protect, authorize("employer"), updateJob);
router.delete("/:id", protect, authorize("employer"), deleteJob);

module.exports = router;
