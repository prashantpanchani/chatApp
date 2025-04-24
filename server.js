const express = require('express')
const { chatRouter } = require('./routes/chatRoutes')
const server = express()
require('dotenv').config()
const path = require('path')
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use('/public', express.static(__dirname + '/public'));



const PORT = process.env.PORT || 3000

server.use(chatRouter)
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
}) 