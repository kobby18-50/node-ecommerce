import BadRequestError from "../errors/bad-request.js"
import NotFoundError from "../errors/not-found.js"
import UnAuthenticatedError from "../errors/unauthenticated.js"
import User from "../models/User.js"
import {StatusCodes} from 'http-status-codes'
import createTokenUser from "../utils/createTokenUser.js"
import { attachCookiesToResponse } from "../utils/jwt.js"
import checkPermissions from "../utils/checkPermissions.js"

const getAllUsers = async (req,res) => {
    const users = await User.find({role : 'user'}).select('-password')

    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async (req,res) => {
    const { id : userID } = req.params

    const user = await User.findOne({_id : userID, role : 'user' }).select('-password')

    if(!user){
        throw new NotFoundError(`User with id ${userID} not found try a different one`)
    }
    // the req.user comes from authenticateUser func 
    // console.log(req.user)

    checkPermissions(req.user, user._id)

    res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async (req,res) => {
    res.status(StatusCodes.OK).json({user : req.user})
}

// update user with user.save
const updateUser = async (req,res) => {
    const {email, name} = req.body

    if(!email || !name){
        throw new BadRequestError('Please provide all details')
    }

    const user = await User.findOne({_id : req.user.userId})

    user.email = email
    user.name = name

    user.save()

    const tokenUser = createTokenUser(user)

    attachCookiesToResponse(res, tokenUser)

    res.status(StatusCodes.ACCEPTED).json({msg : 'User updated', tokenUser})
}



const updateUserPassword = async (req,res) => {
    const { oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword){
        throw new BadRequestError('Please provide all values')
    }

    const user = await User.findOne({_id : req.user.userId})

    if(!user){
        throw new UnAuthenticatedError('No user found')
    }

    const isPasswordCorrect = await user.comparePasswords(oldPassword)

    if(!isPasswordCorrect){
        throw new UnAuthenticatedError('Password does not match old password')
    }

    user.password = newPassword

    await user.save()

    res.status(StatusCodes.OK).json({msg : 'Password updated'})

    
}


export { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword}



// update user with findOneAndUpdate
// const updateUser = async (req,res) => {
//     const {email, name} = req.body

//     if(!email || !name){
//         throw new BadRequestError('Please provide all details')
//     }

//     const user = await User.findOneAndUpdate({_id : req.user.userId}, {name, email}, {new:true, runValidators : true})

//     const tokenUser = createTokenUser(user)

//     attachCookiesToResponse(res, tokenUser)

//     res.status(StatusCodes.ACCEPTED).json({msg : 'User updated', tokenUser})
// }