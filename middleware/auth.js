const jwt = require('jsonwebtoken')
const asyncHanlder = require('./async')

const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

exports.protect = asyncHanlder(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } 
  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  // 验证token
  try {
    // 反解析token得到用户id
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // 根据用户id，去数据查询用户信息，附着在req对象上面，以便后面的controller使用
    console.log('---verified!')
    req.user = await User.findById(decoded.id)
    next()
  } catch(err) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

})

// 为特定角色授权(其实是放行特定角色，阻挡非特定角色)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
    }
    next()
  }
}