const express = require("express");
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");

const Review = require("../models/Review");

const { protect, authorize } = require("../middleware/auth");

// 初始化router，同时设置可以接收其他router传过来的参数(params)
const router = express.Router({ mergeParams: true });

const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: ["name", "description"],
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;
