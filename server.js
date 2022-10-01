const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const connectDB = require('./config/db')

// load env vars
dotenv.config({path: './config/config.env'})

// Connect to database
connectDB()

// route files
const bootcamps = require('./routes/bootcamps')

const app = express()

// Body parser
app.use(express.json())

// route files
app.use('/api/v1/bootcamps', bootcamps)

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}



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