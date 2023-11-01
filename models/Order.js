import mongoose from "mongoose";

const SingleOrderSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },

    image : {
        type : String,
        required : true
    },

    price : {
        type : Number,
        required : true
    },

    amount : {
        type : Number,
        required : true
    },

    product : {
        type : mongoose.Types.ObjectId,
        ref : 'Product',
        required : [true, 'Please provide  product']
    },
})

const OrderSchema = new mongoose.Schema({

    tax : {
        type : Number,
        required : [true, 'Please provide tax']
    },

    shippingFee : {
        type : Number,
        required : [true, 'Please provide shipping fee']
    },

    subtotal : {
        type : Number,
        required : [true, 'Please provide sub total']
    },

    total : {
        type : Number,
        required : [true, 'Please provide  total']
    },

    orderItems : {
        type : [SingleOrderSchema]
    },

    status : {
        type : String,
        required : [true, 'Please provide  status'],
        enum : ['pending', 'delivered', 'failed'],
        default : 'pending'
    },

    user : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : [true, 'Please provide  user']
    },

    clientSecret : {
        type : String,
        required : [true, 'Please provide  client secret']
    },

    paymentIntentId : {
        type : String,
       
    }    
}, {timestamps : true})


export default mongoose.model('Order', OrderSchema)