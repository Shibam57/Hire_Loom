require('dotenv').config()
const connectDB = require('./db/mongoDB.js')
const app = require('./app.js')

const port = process.env.PORT;

connectDB().then(()=>{
    app.on("error", (error)=>{
        console.log("error", error)
        throw error
    })
    app.listen(port, ()=>{
        console.log(`server is running : http://localhost:${port}`)
    })
}).catch((err)=>{
    console.log("MONGO db connection failed !!", err)
})