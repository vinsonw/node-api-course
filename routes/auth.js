const express = require('express')
const { register,login,getMe, forgotPassword, resetPassword } = require('../controllers/auth')
const {protect} = require('../middleware/auth')

router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/me').get(protect, getMe)
router.route('/forgotpassword').post(forgotPassword)
router.route('/resetpassword/:resettoken').put(resetPassword)

module.exports = router