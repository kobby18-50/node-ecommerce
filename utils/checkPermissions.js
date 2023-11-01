import UnAuthenticatedError from "../errors/unauthenticated.js"

// users cannot view details of other users
// only admins and a user can view their own details
const checkPermissions = (requestUser, resourceUserId) => {
    // console.log(requestUser)
    // console.log(resourceUserId)
    // console.log(typeof resourceUserId)

    // so we check if the role is admin before returning the response
    
    if(requestUser.role === 'admin') return
    
    // so we check if the userId from req.user matches the req.params.id before returning the response
    if(requestUser.userId === resourceUserId.toString()) return

    throw new UnAuthenticatedError('You are unathourized to access this route')
}

export default checkPermissions