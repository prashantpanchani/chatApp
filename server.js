const express = require('express')
const server = express()
require('dotenv').config()

server.use(express.json())
server.use(express.urlencoded({ extended: true }))
const PORT = process.env.PORT || 3000

server.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
}) 