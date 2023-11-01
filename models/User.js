import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please enter name'],
        minlength : 6,
        maxlength : 50
    },

    email : {
        type : String,
        required : [true, 'Please enter email'],
        validate : {
            validator : validator.isEmail,
            message : 'Please provide a valid email'
        },
        minlength : 6
    },

    password : {
        type : String,
        required : [true, 'Please enter password'],
        minlength : 6,
    },

    role : {
        type : String,
        enum : ['admin', 'user'],
        default : 'user'
    }

})

UserSchema.pre('save', async function(){

    // updating users with the save method triggers this hook 
    // so we need to provide a safeguard so that this.password is not hashed again
    // so we will use the isModified() method to trigger the hashing only when we update password
   
    // this shows all the values that have been changed
    console.log(this.modifiedPaths())
    // this returns a boolean if the parameter has been modified
    console.log(this.isModified('email'))

    // so if password has not been modified then bcrypt will not do anything

    if(!this.isModified('password')) return

    // if password has been modified then bcrypt will do its duties
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePasswords = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

export default mongoose.model('User', UserSchema)