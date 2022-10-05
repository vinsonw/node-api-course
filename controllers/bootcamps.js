const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require('../utils/geocoder')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  const count = bootcamps.length;
  res.status(200).json({ success: true, count, data: bootcamps });
});

// @desc    Get a single bootcamps
// @route   GET /api/v1/bootcamp/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
});

// @desc    Create a bootcamps
// @route   POST /api/v1/bootcamp/
// @access  Public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // have to use express.json()
  // app.use(express.json())
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Update a bootcamps
// @route   PUT /api/v1/bootcamp/:id
// @access  Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // respond with "new"(updated) data
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete a bootcamps
// @route   DELETE /api/v1/bootcamp/:id
// @access  Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  console.log("---deleted", bootcamp);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404)
    );
  }
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
});

// @desc    Get all bootcamps within radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lng = loc[0].longitude
  const lat = loc[0].latitude

  // 计算半径
  // 地球半径 3963 miles or 6378 km (这里使用miles)
  const radius = distance / 3963

  const bootcamps = await Bootcamp.find({
    'location.coordinates': { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  const count = bootcamps.length;
  res.status(200).json({ success: true, count, data: bootcamps });
});
