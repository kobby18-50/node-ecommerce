import express from 'express'
import { getAllReviews, getSingleReview, createReview, updateReview, deleteReview} from '../controllers/reviewController.js'
import { authenticatedUser } from '../middleware/authentication.js'

const router = express.Router()

router.route('/').get(getAllReviews).post(authenticatedUser, createReview)

router.route('/:id').get(getSingleReview).patch(authenticatedUser, updateReview).delete(authenticatedUser, deleteReview)

export default router

