const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

// const BootcampSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please add a name'],
//     unique: true,
//     trim: true,
//     maxlenght: [50, 'Name can not be more than 50 chars']
//   },
//   slug: String,
//   description: {
//     type: String,
//     required: [true, 'Please add a name'],
//     maxlenght: [500, 'Description can not be more than 500 chars']
//   },
//   website: {
//     type: String,
//     match: [
//       /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
//       'Please use a valid URL with HTTP or HTTPS'
//     ]
//   },
//   phone: {
//     type: String,
//     maxlenght: [20, 'Phone number can not be longer than 20 characters']
//   },
//   email: {
//     type: String,
//     match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//     'Please enter a valid emial address' ] 
//   },
//   address: {
//     type: String,
//     required: [true, 'Please enter an address']
//   },
//   location: {
//     // Geo json
//     type: {
//       type: String,
//       enum: ['Point'],
//       // required: true
//     },
//     // array of numbers
//     coordinates: {
//       type: [Number],
//       // required: true,
//       index: '2dsphere'
//     },
//     formattedAddress: String,
//     street: String,
//     city: String,
//     state: String,
//     zipcode: String,
//     country: String
//   },
//   careers: {
//     // Array of strings
//     type: [String],
//     required: true,
//     enum: [
//       "Web Development", 
//       "UI/UX", 
//       "Mobile Development",
//       "Data Science",
//       "Business",
//       "Other"
//     ]
//   },
//   averageRating: {
//     type: Number,
//     min: [1, 'Rating must be at least 1'],
//     max: [10, 'Rating cannot be higher than 10']
//   },
//   averageCost: Number,
//   photo: {
//     type: String,
//     default: 'no-photo.jpg'
//   },
//   housing: {
//     type: Boolean,
//     default: false
//   },
//   jobAssistance: {
//     type: Boolean,
//     default: false
//   },
//   jobGuarantee: {
//     type: Boolean,
//     default: false
//   },
//   acceptGi: {
//     type: Boolean,
//     default: false
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// })


const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


// create bootcamp slug from the name
BootcampSchema.pre('save', function(next) {
  // console.log('Slugify ran', this.name);
  // 根据name字段创建slug字段
  this.slug = slugify(this.name, {lower: true})
  next()
})

// Geocode & create location field
BootcampSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address)
  this.location = {
    type: 'point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    zipcode: loc[0].zipcode,
    city: loc[0].city,
    state: loc[0].stateCode,
    country: loc[0].countryCode
  }
  // address不要了
  this.address = undefined
  next()
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)