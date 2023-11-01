import User from "../models/User.js"
import { StatusCodes } from 'http-status-codes'
import BadRequestError from '../errors/bad-request.js'
import NotFoundError from '../errors/not-found.js'
import UnAuthenticatedError from '../errors/unauthenticated.js'
import {attachCookiesToResponse} from "../utils/jwt.js"
import createTokenUser from '../utils/createTokenUser.js'

const register = async (req,res) => {
    const {email, name, password} = req.body

    const emailAlreadyExits = await User.findOne({email})

    if(emailAlreadyExits){
        throw new BadRequestError(`User with email ${email} already exits`)
    }

    const isFirstAccount = await User.countDocuments({}) === 0
    
    const role = isFirstAccount ?  'admin' :  'user'

    const user = await User.create({name, email, password, role})

    const tokenUser = createTokenUser(user)

    attachCookiesToResponse(res, tokenUser)

    res.status(StatusCodes.CREATED).json({user : tokenUser})

    

    
    
}

const login = async (req,res) => {
    const { email, password } = req.body

    if(!email || !password){
        throw new BadRequestError('Please provide email and password')
    }


    const user = await User.findOne({email})

    if(!user){
        throw new NotFoundError('No user found')
    }

    
    const passwordMatch = await user.comparePasswords(password)

    if(!passwordMatch){
        throw new UnAuthenticatedError('Invalid Credentials')
    }

    const tokenUser = createTokenUser(user)
    // we attach the token as a cookie to the request so that we can use it in the authenticatedUser func
    attachCookiesToResponse(res, tokenUser)

    res.status(StatusCodes.OK).json({user : tokenUser})
}

const logout = async (req,res) => {
    res.cookie('token', 'logout', {
        httpOnly : true,
        expires : new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({msg : 'User logged out'})
} 

export {register,login,logout}