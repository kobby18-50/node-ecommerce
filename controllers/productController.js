import { StatusCodes } from 'http-status-codes'
import Product from '../models/Product.js'
import NotFoundError from '../errors/not-found.js'
import BadRequestError from '../errors/bad-request.js'
// file upload work around 
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const getAllProducts = async (req,res) => {
    const products = await Product.find({})

    res.status(StatusCodes.OK).json({products, count : products.length})
}

const getSingleProduct = async (req,res) => {
    const product = await Product.findOne({_id : req.params.id}).populate('reviews')

    if(!product){
        throw new NotFoundError(`Product with id ${req.params.id} not found`)
    }
    res.status(StatusCodes.OK).json({product})
}

const createProduct = async (req,res) => {
    req.body.user = req.user.userId

    const product = await Product.create(req.body)

    if(product){
        throw new BadRequestError('This is product has already been created')
    }
    
    res.status(StatusCodes.CREATED).json({product})
}

const uploadImage = async (req,res) => {
    console.log(req.files)
    // lets check if a file has been uploaded
    if(!req.files){
        throw new BadRequestError('No File Uploaded')
    }
    // creating a variable to hold the image obj
    const productImage = req.files.image

    // let's check if the file uploaded is an image
    if(!productImage.mimetype.startsWith('image')){
        throw new BadRequestError('Please upload an image')
    }

    // lets set max size for the image
    const maxSize = 1024 * 1024

    if(productImage.size > maxSize ){
        throw new BadRequestError(`Image should be less than ${maxSize} KB or 1MB`)
    }

    // creating a path for the image
    const imagePath = path.join(__dirname, "../public/uploads/" + `${productImage.name}`)

    // then we move the image to the path set above
    await productImage.mv(imagePath)

    res.status(StatusCodes.OK).json({image : `/uploads/${productImage.name}`})
}

const updateProduct = async (req,res) => {
    const product = await Product.findOneAndUpdate({_id : req.params.id}, req.body, {new: true, runValidators : true})

    if(!product){
        throw new NotFoundError(`Product with id ${req.params.id} not found`)
    }

    res.status(StatusCodes.ACCEPTED).json({product})
}

const deleteProduct = async (req,res) => {
    
    const product = await Product.findOne({_id : req.params.id})

    if(!product){
        throw new NotFoundError(`Product with id ${req.params.id} not found`)
    }

    await product.deleteOne()
    
    res.status(StatusCodes.OK).json({msg : 'Product deleted'})
}


export { getAllProducts, getSingleProduct, createProduct, uploadImage, updateProduct, deleteProduct}