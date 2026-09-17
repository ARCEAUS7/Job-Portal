require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();

  const name = process.env.SEED_ADMIN_NAME || "Platform Admin";
  const email = process.env.SEED_ADMIN_EMAIL || "admin@jobportal.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  let admin = await User.findOne({ email }).select("+password");

  if (admin) {
    console.log(`Admin already exists: ${email}`);
  } else {
    admin = await User.create({ name, email, password, role: "admin" });
    console.log(`Admin created: ${admin.email}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
