const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxlength: 1000,
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add rating between 1 and 10"],
  },
  cratedAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Static method to get avg of course tuitions
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  console.log("Calculating avg rating".blue);

  // This is called "Aggregation Pipline"
  // https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log('--obj.averageRating',obj[0].averageRating);
  // 将aggreation结果存入bootcamps表中
  // TODO 存在本地会出现bootcamps表中averageCost字段部分值丢失的情况
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.log("---error", error);
  }
};

// Call getAverageRating after save(注意seeder导入无效)
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before save(注意seeder导入无效)
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// 限制每个user在每个bootcamp只能有一个review
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
