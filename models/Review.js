import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    rating : {
        type : Number,
        min : 1,
        max : 5,
        required : [true, 'Please provide rating']
    },

    title : {
        type : String,
        trim : true,
        required : [true, 'Please provide review title'],
        maxlength : 100
    },

    comment : {
        type : String,
        required : [true, 'Please add review']
    },

    user : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : [true, 'Please add user']
    },

    product : {
        type : mongoose.Types.ObjectId,
        ref : 'Product',
        required : [true, 'Please add product']
    }
}, {timestamps:true})

// user can add only one review per product
ReviewSchema.index({product : 1, user : 1}, {unique : true} )

ReviewSchema.statics.calculateAverageRating = async function(productId){
    const result = await this.aggregate([
        {$match : { product : productId}},
        { $group : {
            _id : null,
            averageRating : { $avg : '$rating'},
            numOfReviews : { $sum : 1}
        }}
    ])
    console.log(result)

    try {
        await this.model('Product').findOneAndUpdate(
            { _id : productId },
            { averageRating : Math.ceil(result[0]?.averageRating || 0),
            numOfReviews : result[0]?.numOfReviews || 0}
        )
    } catch (error) {
        console.log(error)
    }
}

ReviewSchema.post('save', async function(){
    await this.constructor.calculateAverageRating(this.product)
    // console.log('post save hook called')
})

ReviewSchema.post('deleteOne', {document : true, query : false}, async function(){
    // console.log('post delete hook called')
    await this.constructor.calculateAverageRating(this.product)

})



export default mongoose.model('Review', ReviewSchema)