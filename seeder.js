const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");
const Review = require("./models/Review");

// const connectDB = require('./config/db')
// connectDB()

console.log('----尝试连接数据库...')
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('----连接成功')
  // 必须连接上了才能进行后续操作，否则报错
  const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`),
    "utf-8"
  );

  const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`),
    "utf-8"
  );

  const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`),
    "utf-8"
  );

  const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`),
    "utf-8"
  );

  const importData = async () => {
    try {
      await Bootcamp.create(bootcamps);
      await Course.create(courses);
      await User.create(users);
      await Review.create(reviews);
      console.log("Data imported...".green.inverse);
      process.exit();
    } catch (err) {
      console.log(err);
    }
  };

  // Delete data
  const deleteData = async () => {
    try {
      await Bootcamp.deleteMany();
      await Course.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();
      console.log("Data destroyed".red.inverse);
      process.exit();
    } catch (err) {
      console.log(err);
    }
  };

  if (process.argv[2] === "-i") {
    importData();
  } else if (process.argv[2] === "-d") {
    deleteData();
  }
});
