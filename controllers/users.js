
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");


// @desc   get all users
// @route  GET /api/v1/users
// @access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
});


// @desc   get one user
// @route  GET /api/v1/users/:id
// @access Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorResponse(`User with id ${req.params.id} not found`, 404))
  }
  res.status(200).json({
    success: true,
    data: user
  })
});

// @desc   Create one user
// @route  POST /api/v1/users
// @access Private/Admin
exports.addUser = asyncHandler(async (req, res, next) => {
  // const { name, email, password } = req.body
  const user = await User.create(req.body)

  res.status(201).json({
    success: true,
    data: user
  })
});

// @desc   Delete one user
// @route  DELETE /api/v1/users/:id
// @access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // const { name, email, password } = req.body
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404))
  }

  await user.remove()

  res.status(200).json({
    success: true,
    data: {}
  })
});

// @desc   Update one user
// @route  PUT /api/v1/users/:id
// @access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404))
  }

  await user.update(req.body, {
    new: true
  })

  res.status(200).json({
    success: true,
    data: user
  })
});