const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");


const advancedResults = require('../middleware/advancedResults')
const {protect, authorize} = require('../middleware/auth')
const Bootcamp = require('../models/Bootcamp')
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')
const router = express.Router();



// 将特定route委托给响应的router处理
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)


router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius)


router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router
  .route("/")
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
