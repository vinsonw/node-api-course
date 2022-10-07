const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')

// load env vars
dotenv.config({path: './config/config.env'})

// Connect to database
connectDB()

const app = express()
// Body parser
app.use(express.json())

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(fileupload())

// 设置静态
app.use(express.static(path.join(__dirname, 'public')))

// 解析req.headers中的cookie => req.cookie对象
app.use(cookieParser())

// 如果放在app.use(morgan('dev'))前面，morgan不会生效
// route files
const bootcamps = require('./routes/bootcamps')
app.use('/api/v1/bootcamps', bootcamps)

const courses = require('./routes/courses')
app.use('/api/v1/courses', courses)

const auth = require('./routes/auth')
app.use('/api/v1/auth', auth)


app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`Listening on port ${PORT}`.yellow.bold))

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red)
  // close server & exit process
  server.close(() => {
    process.exit(1)
  })
})