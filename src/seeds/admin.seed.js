const userModel = require('../models/user.model')

const seedAdmin = async function () {
  try {
    const adminCount = await userModel.countDocuments({ role: "Admin" });

    if (adminCount === 0) {
      await userModel.create({
        name: "Admin",
        password: process.env.DEFAULT_ADMIN_PASSWORD,
        role: "Admin"
      });

      console.log("Default Admin Created");
    }
  } catch (error) {
    console.error("Admin Seeding Error:", error);
  }
}

module.exports = seedAdmin;