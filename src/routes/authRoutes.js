const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  logout,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["jobseeker", "employer"])
    .withMessage("Role must be 'jobseeker' or 'employer'"),
];

router.post("/register", registerValidation, register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

module.exports = router;
