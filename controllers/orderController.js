import BadRequestError from "../errors/bad-request.js"
import NotFoundError from "../errors/not-found.js"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import {StatusCodes} from 'http-status-codes'
import checkPermissions from "../utils/checkPermissions.js"

// 

const fakeStripeAPI = async ({currency, amount}) => {
    const clientSecret = 'someClientSecret'
    return {amount, clientSecret }
}

// 

const getAllOrders = async (req,res) => {
    const orders = await Order.find({})

    res.status(StatusCodes.OK).json({orders, count : orders.length})
}

const getSingleOrder = async (req,res) => {
    const { id:orderId } = req.params

    const order = await Order.findOne({_id : orderId })
    
    checkPermissions(req.user, order.user)

    if(!order){
        throw new NotFoundError(`No order with id ${orderId} found`)
    }

    res.status(StatusCodes.OK).json({order})

   
}

const getCurrentUserOrders = async (req,res) => {
   
    const order = await Order.find({user : req.user.userId})

    res.status(StatusCodes.OK).json({order, count : order.length})
}

const createOrder = async (req,res) => {
    const { items : cartItems, tax, shippingFee } = req.body

    if(!cartItems || cartItems.length < 1){
        throw new BadRequestError('Cart items is empty')
    }

    if(!tax || !shippingFee){
        throw new BadRequestError('Tax or shipping fee is empty')
    }

    let orderItems = []
    let subtotal = 0

    // cartitems is an array so we must loop through it to get the product property

    for(const item of cartItems){
        const dbProduct = await Product.findOne({_id : item.product})

        if(!dbProduct){
            throw new NotFoundError(`Product with id ${item.product} not found`)
        }
        // we now have access to the product from db with all its properties
        // console.log(dbProduct)

        const { name, price, image, _id} = dbProduct
        // we now create an order item 
        const singleOrderItem = {
            amount : item.amount,
            name,
            price,
            image,
            product : _id

        }

        // add item to order
        orderItems = [...orderItems, singleOrderItem]

        // calc subtotal
        subtotal += item.amount * price
    }

    // console.log(orderItems)
    // console.log(subtotal)

    // calc total
    const total = shippingFee + tax + subtotal

    // get client secret
    const paymentIntent = await fakeStripeAPI({
        amount : total,
        currency : 'usd'
    })

    // console.log(paymentIntent)

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret : paymentIntent.clientSecret,
        user : req.user.userId
    })

    res.status(StatusCodes.CREATED).json({order, clientSecret : order.clientSecret})
}

const updateOrder = async (req,res) => {
    const { id : orderId} = req.params
    const { paymentIntentId } = req.body

    const order = await Order.findOne({_id : orderId})

    if(!order){
        throw new NotFoundError(`No order with id ${orderId} found`)
    }

    checkPermissions(req.user, order.user)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'



    res.status(StatusCodes.OK).json({order})
}

export { getAllOrders, getSingleOrder, getCurrentUserOrders, createOrder, updateOrder}

