const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')


// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamp
// @access  Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find()
    res.status(200).json({success: true, data: bootcamps})
  } catch (err) {
    next(err)
  }
};

// @desc    Get a single bootcamps
// @route   GET /api/v1/bootcamp/:id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404))
    }
    res.status(200).json({success: true, data: bootcamp})
  } catch (err) {
    next(err)
  }
};

// @desc    Create a bootcamps
// @route   POST /api/v1/bootcamp/
// @access  Public
exports.createBootcamp = async (req, res, next) => {
  // have to use express.json()
  // app.use(express.json())
  try {
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({ 
      success: true, 
      data: bootcamp,
    });
  } catch (err) {
    next(err)
  }
};

// @desc    Update a bootcamps
// @route   PUT /api/v1/bootcamp/:id
// @access  Public
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // respond with "new"(updated) data
      runValidators: true
    });
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404))
    }
    res.status(200).json({ success: true, data: bootcamp })
  } catch (err) {
    next(err)
  }
}

// @desc    Delete a bootcamps
// @route   DELETE /api/v1/bootcamp/:id
// @access  Public
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp =  await Bootcamp.findByIdAndDelete(req.params.id)
    console.log('---deleted', bootcamp)
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404))
    }
    res
      .status(200)
      .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
  } catch (err) {
    next(err)
  }
};
