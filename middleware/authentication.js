import {isTokenValid} from '../utils/jwt.js'
import UnAuthenticatedError from '../errors/unauthenticated.js'
import UnAuthorizedError from '../errors/unauthorized.js'

const authenticatedUser = async (req,res,next) => {
    const token = req.signedCookies.token



    if(!token){
        throw new UnAuthenticatedError('User not authorized')
    }

    try {
        // const payload = isTokenValid(token)
        // the values of payload is {userId,name, role}
        
        // lets destructure the values and assign it to req.user

        const { userId, name, role} = isTokenValid(token)

        req.user = {userId, name, role}

          next()
    } catch (error) {
        throw new UnAuthenticatedError('User not authorized')
    }

}

const authourizePermission = (...roles) => {
    // if(req.user.role !== 'admin'){
    //     throw new UnAuthorizedError('Unauthorized to access this route')
    // }
    // console.log('admin route')
    // next()

    return ((req,res,next) => {
        if(!roles.includes(req.user.role)){
            throw new UnAuthorizedError('Unauthorized to access this route')
        }

        
        next()
    })


}

export {
    authenticatedUser,
    authourizePermission
}