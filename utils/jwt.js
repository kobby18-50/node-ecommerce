import jwt from 'jsonwebtoken'

const createToken = (payload) => {
    // we create the token by passing in a payload(which is mostly an obj)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn : process.env.JWT_LIFETIME})

    return token
}

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET)


// this func allows us to create the token and attach cookie
const attachCookiesToResponse = (res, user) => {
    const token = createToken(user)

    // oneDay = 1000ms * 60mins * 24hrs
    const oneDay = 1000 * 60 * 24

    // the first parameter is the cookie name, second parameter is the cookie value
    res.cookie('token', token, {
        httpOnly : true,
        expiresIn : new Date(Date.now() + oneDay),
        // if we are in development cookies should be sent
        secure : process.env.NODE_ENV === 'production',
        signed : true
    })
}

export {createToken, isTokenValid, attachCookiesToResponse}