const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllJobsAdmin,
  getJobByIdAdmin,
  deleteJobAdmin,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getAllJobsAdmin);
router.get("/jobs/:id", getJobByIdAdmin);
router.delete("/jobs/:id", deleteJobAdmin);

module.exports = router;
