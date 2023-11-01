import { StatusCodes } from "http-status-codes"
import BadRequestError from "../errors/bad-request.js"
import NotFoundError from "../errors/not-found.js"
import Product from "../models/Product.js"
import Review from "../models/Review.js"
import checkPermissions from "../utils/checkPermissions.js"

const getAllReviews = async (req,res) => {
    // since we referenced product in the review model we can find the product from the model and display the values we want to display(product model) this is done by chaining the populate method and pass the path which comes from the review model(check review model ln 29-32) and select the properties we want to display
    const reviews = await Review.find({}).populate({
        path : 'product',
        select : 'name company price'
    })

    res.status(StatusCodes.OK).json({reviews, count : reviews.length})
}

const getSingleReview = async (req,res) => {
    const {id : reviewId} = req.params

    const review = await Review.findOne({_id : reviewId})

    if(!review){
        throw new NotFoundError(`No review with id ${reviewId} found`)
    }


    res.status(StatusCodes.OK).json({review})
}
 
const createReview = async (req,res) => {
    // we first pass in the product which is an id so we rename it to productId
    const { product : productId} = req.body

    // we verify the productId by checking if there is a product with that id
    const isValidProduct = await Product.findOne({_id : productId})

    if(!isValidProduct){
        throw new NotFoundError(`No product with ${productId} found`)
    }

    // verify if there is a review by the user of the product since users are allowed one review per product

    const reviewAlreadyExits = await Review.findOne({user: req.user.userId, product : productId})

    if(reviewAlreadyExits){
        throw new BadRequestError('User cannot add more than one review per product')
    }
    req.body.user = req.user.userId 
   
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}

const updateReview = async (req,res) => {
    const {id : reviewId} = req.params
    const { rating, title, comment } = req.body
    const review = await Review.findOne({_id : reviewId})
    
    if(!review){
        throw new NotFoundError(`No review with id ${reviewId} found`)
    }

    // check permission
    checkPermissions(req.user, review.user)

    // manually assigning the values
    review.rating = rating
    review.title = title
    review.comment = comment

    await review.save()



    res.status(StatusCodes.ACCEPTED).json({review})
}

const deleteReview = async (req,res) => {
    const {id : reviewId} = req.params
    const review = await Review.findOne({_id : reviewId})

    if(!review){
        throw new NotFoundError(`No review with id ${reviewId} found`)
    }

    // checking that the action can only be performed by admins and the user that created the review only
    checkPermissions(req.user, review.user)

    await review.deleteOne()
   
    res.status(StatusCodes.OK).json({msg : 'Review deleted'})
}

const getSingleProductReviews = async (req,res) => {
    const {id : productId } = req.params

    const reviews =  await Review.find({product : productId })

    res.status(StatusCodes.OK).json({reviews, count : reviews.length})
}
export { getAllReviews, getSingleReview, createReview, updateReview, deleteReview, getSingleProductReviews}