const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const path = require("path");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get a single bootcamps
// @route   GET /api/v1/bootcamp/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id).populate("courses");
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

  // add user to req.body
  req.body.user = req.user.id; // from middleware

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If the user is not admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

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
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404)
    );
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized to update bootcamp with id ${req.params.id}`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // respond with "new"(updated) data
    runValidators: true,
  });
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete a bootcamps
// @route   DELETE /api/v1/bootcamp/:id
// @access  Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // 下面这种写法无法触发BootcampSchema.pre('remove', action)钩子
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  const bootcamp = await Bootcamp.findById(req.params.id);
  // console.log("---deleted", bootcamp);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404)
    );
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized to delelte bootcamp with id ${req.params.id}`,
        401
      )
    );
  }

  // 触发BootcampSchema.pre('remove', action)钩子
  bootcamp.remove();

  res
    .status(200)
    .json({ success: true, msg: `Deleted bootcamp ${req.params.id}` });
});

// @desc    Get all bootcamps within radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lng = loc[0].longitude;
  const lat = loc[0].latitude;

  // 计算半径
  // 地球半径 3963 miles or 6378 km (这里使用miles)
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    "location.coordinates": {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });
  const count = bootcamps.length;
  res.status(200).json({ success: true, count, data: bootcamps });
});

// @desc    Upload a bootcamp photo
// @route   PUT /api/v1/bootcamp/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  // 下面这种写法无法触发BootcampSchema.pre('remove', action)钩子
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  const bootcamp = await Bootcamp.findById(req.params.id);
  // console.log("---deleted", bootcamp);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404)
    );
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized to update bootcamp with id ${req.params.id}`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload a photo", 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    return next(
      new ErrorResponse("Please upload a photo, this is not a photo", 400)
    );
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a photo less than ${
          process.env.MAX_FILE_UPLOAD / 1000000
        }M`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`; //添加原文件名后缀

  // 下面的process.env.FILE_UPLOAD_PATH存的路径是"./public/uploads"
  // 嗯....？
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with uploading`, 500));
    }

    // 文件名存到bootcamps表的photo字段
    await Bootcamp.findByIdAndDelete(req.param.id, {
      photo: file.name,
    });
  });
  console.log(file.name);
  res.status(200).json({ success: true, data: file.name });
});
