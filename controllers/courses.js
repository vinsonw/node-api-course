
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");



// @desc    Get all courses OR get all courses from a specific bootcamp 
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {

  // 从routes/bootcamps.js那里接到的委托
  // @route   GET /api/v1/bootcamps/:bootcampId/courses
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId })
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  }
  // @route   GET /api/v1/courses
  else {
    res.status(200).json(res.advancedResults)
  }

})

// @desc    Get a single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {

  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: ['name', 'description']
  })

  if (!course) {
    return next(new ErrorResponse(`No course found with id ${req.params.id}`), 404)
  }

  res.status(200).json({
    success: true,
    data: course
  })
})


// @desc    add a course
// @route   POST /api/v1/courses
// @access  Public
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId

  req.body.user = req.user.id

  // 先确定bootcamp存在, course必须添加到具体的bootcamp上
  const bootcamp = await Bootcamp.findById(req.params.bootcampId)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    )
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to add course to bootcamp with id ${req.params.id}`, 401)
    );
  }

  
  const course = await Course.create(req.body)

  res.status(200).json({
    success: true,
    data: course
  })
})


// @desc    update a course
// @route   PUT /api/v1/courses/:id
// @access  private 
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id)

  console.log('---course to update', course);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id${req.params.id}`, 404))
  }

  // make sure user is course owner
  // 不管是course.user还是bootcamp.user都是同一个user id, 因为一个cousre对应一个bootcamp, 一个bootcamp对应一个
  // user, 这个user除了存在bootcamps表中，还同时存在了courses表中
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to update course to bootcamp with id ${req.params.id}`, 401)
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: course
  })
})


// @desc    delete a course
// @route   DELETE /api/v1/courses/:id
// @access  private 
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    next(new ErrorResponse(`Course not found with id${req.params.id}`, 404))
  }


  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to delete to bootcamp with id ${req.params.id}`, 401)
    );
  }
  // 为了触发钩子 
  await course.remove()

  res.status(200).json({
    success: true,
    data: course
  })
})


