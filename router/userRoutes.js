
import express from 'express'
import {getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword} from '../controllers/userController.js'
import { authenticatedUser, authourizePermission } from '../middleware/authentication.js'

const router = express.Router()

router.route('/').get(authenticatedUser,authourizePermission('admin', 'owner'), getAllUsers)

router.route('/showMe').get(authenticatedUser, showCurrentUser)

router.route('/updateUser').patch(authenticatedUser, updateUser)

router.route('/updateUserPassword').patch(authenticatedUser, updateUserPassword)

router.route('/:id').get(authenticatedUser, getSingleUser)


export default router