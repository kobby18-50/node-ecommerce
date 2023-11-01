import express from 'express'
import 'express-async-errors'

import dotenv from 'dotenv'
dotenv.config()

// db import
import connectDB from './db/connect.js'

// middleware imports
import notFoundMiddleWare from './middleware/not-found.js'
import errorHandlerMiddleWare from './middleware/error-handler.js'

// routes import
// auth router
import authRouter from './router/authRoutes.js'

// user router
import userRouter from './router/userRoutes.js'

// product router
import productsRoutes from './router/productRoutes.js'

// review router
import reviewsRoutes from './router/reviewRoutes.js'

// order router
import orderRouter from './router/orderRoutes.js'

// other packages import 
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

// security packages
import rateLimiter from 'express-rate-limit'
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'
import cors from 'cors'

const app = express()

// security
app.set('trust proxy', 1)
app.use(
    rateLimiter({
        windowMs : 15 * 60 * 1000,
        max : 60
    })
)
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())
app.use(cors())



// express.json
app.use(express.json())

// cookie parser
app.use(cookieParser(process.env.JWT_SECRET))

// static folder
app.use(express.static('./public'))

// file upload
app.use(fileUpload())

// routes

// auth routes
app.use('/api/v1/auth', authRouter)

// user routes
app.use('/api/v1/users', userRouter)

// products routes
app.use('/api/v1/products', productsRoutes)

// review routes
app.use('/api/v1/reviews', reviewsRoutes)

// order routes
app.use('/api/v1/orders', orderRouter)

// middleware
app.use(notFoundMiddleWare)
app.use(errorHandlerMiddleWare)


// port
const port = process.env.PORT || 5000

// start 
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, ()=>{console.log(`Server listening on port ${port}`)})
    } catch (error) {
        console.log(error)
    }
}

start()