// 这个函数本身不是中间件函数，它的返回值是一个中间件函数
const advancedResults = (model, populate) => async(req, res, next) => {

  let query

  // 复制一份req.query
  const reqQuery = {...req.query}

  // 排除不需要查询的情况
  const removeFields = ['select', 'sort', 'page', 'limit']
  removeFields.forEach(param => delete reqQuery[param])

  let queryStr = JSON.stringify(reqQuery)
  // 学到了！
  // 创建$开头查询操作符
  // 例子：{ averageCost: { gt: 10000 } } => { averageCost: { $gt: 10000 } }
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

  // 生成查询(还没有执行)
  query = model.find(JSON.parse(queryStr))

  if (req.query.select) {
    // mongoose要求select参数需要是'name age'这样中间用空格隔开的字符串
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  if (req.query.sort) {
    // 排序字段前面可以有负号，表示倒序排列，如'-name'
    const fields = req.query.sort.split(',').join(' ')
    query = query.sort(fields)
  } else {
    query = query.sort('-createdAt')
  }

  // 分页
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments()
  query = query.skip(startIndex).limit(limit)

  // Populate
  if (populate) {
    query = query.populate(populate)
  }

  // 执行查询
  const results = await query

  // 准备一个pagination对象
  const pagination = {}
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }   
  }
  if (startIndex > 0) {
    pagination.pre = {
      page: page - 1,
      limit
    }
  }

  // 将查询结果保存到一个res的一个属性上，这样下游的controller就可以使用了
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }

  next()
}

module.exports = advancedResults