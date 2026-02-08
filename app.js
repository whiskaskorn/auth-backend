const express = require('express')
const mongoose = require('mongoose')
const PORT = 5000;
require('dotenv').config()
const app = express()

app.use(express.json())
app.use(express.static('frontend_files'))

mongoose.connect('mongodb://localhost:27017/auth-backend')
.then(()=>{
    console.log(`Database connected!`)
})
.catch((error)=>{
    console.log(error)
})

app.use(express.urlencoded({extended: true}))
app.use(require('./routers/router'))
app.listen(PORT,()=>{
    console.log(`Server working on PORT: ${PORT}`)
})