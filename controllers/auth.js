const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create token
  // const token = user.getSignedJwtToken()

  // res.status(200).json({ success: true, token })
  sendTokenResponse(user, 200, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emial and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an mail and password", 400));
  }

  // check for user existence
  const user = await User.findOne({ email }).select("+password"); //password默认不返回，用select表示需要返回
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // check for password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Create token
  // const token = user.getSignedJwtToken()

  // res.status(200).json({ success: true, token })

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 3600 * 1000
    ),
    httpOnly: true,
  };

  // 生产环境下设置secure flag
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options) // express自带的设置cookie的方法
    .json({
      success: true,
      token,
    });
};

// @route GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// @route PUT /api/v1/auth/updateuserinfo
exports.updateUserInfo = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    email: req.body.email,
    name: req.body.name
  }
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @route PUT /api/v1/auth/changepassword
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user.id).select('+password')
  if (!(await user.matchPassword(currentPassword))) {
    next(new ErrorResponse('Wrong password', 400))
  }
  user.password = newPassword
  await user.save()
  sendTokenResponse(user, 200, res)
})


// @route POST /api/v1/auth/forgotpassword
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("No user with the email", 404));
  }

  // get reset toekn, 同时添加了resetPasswordToken和resetPasswordExpire两个字段在user上，但是没有保存到数据库
  const resetToken = user.getResetPasswordToken();

  // 将user上添加的两个字段保存到数据库
  await user.save({ validateBeforeSave: false });

  // 创建reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // 因为没有前端，所以需要用postman向特定endpoint(这里是resetUrl)发起PUT请求来重置密码
  const message = `You are receiving this email because you (or someone else) has requested the reset of a 
  password. PLease make a PUT request to \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "重置密码token",
      message,
    });
    res.status(200).json({ success: true, data: "Email sent" });
  } catch (error) {
    console.log("---reset password err", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @route PUT /api/v1/auth/resetpassword/:resettoken
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 获得hashed的resetPasswordToken
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // 查找有该token且token未过期的用户
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  // 如果这样的用户不存在
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400))
  }

  // 如果这样的用户存在，接受用户提交的新密码并保存，horrrrrray!!
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  sendTokenResponse(user, 200, res);
});
