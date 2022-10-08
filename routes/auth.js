const express = require('express')
const { register,login,getMe, updateUserInfo, changePassword, forgotPassword, resetPassword } = require('../controllers/auth')
const {protect} = require('../middleware/auth')

router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/me').get(protect, getMe)
router.route('/updateuserinfo').put(protect, updateUserInfo)
router.route('/changepassword').put(protect, changePassword)
router.route('/forgotpassword').post(forgotPassword)
router.route('/resetpassword/:resettoken').put(resetPassword) // protected by nature

module.exports = router