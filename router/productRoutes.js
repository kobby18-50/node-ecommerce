import express from 'express'
import { getAllProducts, getSingleProduct, createProduct, uploadImage, updateProduct, deleteProduct} from '../controllers/productController.js'
import { authenticatedUser, authourizePermission } from '../middleware/authentication.js'
import { getSingleProductReviews } from '../controllers/reviewController.js'

const router = express.Router()

router.route('/').get(getAllProducts)

router.post('/create', [authenticatedUser, authourizePermission('admin')], createProduct)

router.post('/upload', [authenticatedUser, authourizePermission('admin')],  uploadImage)


router.route('/:id').get(getSingleProduct).patch( [authenticatedUser, authourizePermission('admin')], updateProduct).delete([authenticatedUser, authourizePermission('admin')], deleteProduct)

router.get('/:id/reviews', getSingleProductReviews)

export default router