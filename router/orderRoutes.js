import express from 'express'
import { getAllOrders, getSingleOrder, getCurrentUserOrders, createOrder, updateOrder} from '../controllers/orderController.js'
import { authenticatedUser, authourizePermission } from '../middleware/authentication.js'


const router = express.Router()

router.route('/').post(authenticatedUser, createOrder).get([authenticatedUser, authourizePermission('admin')], getAllOrders)

router.route('/showAllMyOrders').get(authenticatedUser, getCurrentUserOrders)

router.route('/:id').get(authenticatedUser, getSingleOrder).patch(authenticatedUser, updateOrder)


export default router