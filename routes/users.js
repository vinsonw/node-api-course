// admins only

const express = require("express");
const {
  getUser,
  getUsers,
  addUser,
  deleteUser,
  updateUser,
} = require("../controllers/users");

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require('../middleware/advancedResults')
const User = require('../models/User')

const router = express.Router();

// 为后面的route统一添加protect和authorize
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(addUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router
