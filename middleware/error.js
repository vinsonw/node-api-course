const ErrorResponse = require('../utils/errorResponse')
const errorHandler = (err, req, res, next) => {
  let error = {...err}
  // 因为message is not enumerable, 所以无法通过spread syntax复制过来
  error.message = err.message

  // console.log(err.stack)

  // 不论是bootcamp id的格式错误还是格式正确但是不存在，err.name都是CastError <- 测试出来的结果(更有可能的是讲师之前已经知道了)
  // mongoose bad object id
  if (err.name === 'CastError') {
    const message = `Bootcamp not found with id of ${err.value}`
    // overwrite the whole error
    error = new ErrorResponse(message, 404)
  }

  // Schema定义为unique的列出现了重复值
  // duplicate key
  if (err.code === 11000) {
    error = new ErrorResponse('Duplicate key', 400)
  }


  // Schema验证错误
  if (err.name === 'ValidationError') {
    console.log('--I will show up for ValidationError---');
    const message = Object.values(err.errors).map(val => val.message).join(';')
    error = new ErrorResponse(message, 400)
  }


  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message
  })

}

module.exports = errorHandler