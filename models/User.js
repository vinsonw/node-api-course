const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
    required: [true, "Please add an email address"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "publisher"], // 设置admin需要直接操作mongodb
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    // 查询时不会作为结果返回
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 用bcryptjs加密用户密码
UserSchema.pre("save", async function (next) {
  // 只有当密码被修改的时候才运行后面的逻辑，防止reset password时await user.save()出错
  if (!this.isModified('password')) {
    next()
  }

  // salt存储在hashed password中，即存储在数据库中
  // https://stackoverflow.com/a/6833165/9649450
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); // 即salt存储在返回值中
});

// JWT签名并返回
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// 匹配用户输入密码和数据库中已哈希的密码
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate the token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set expire in 10 minitues
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  return resetToken

};

module.exports = mongoose.model("User", UserSchema);
