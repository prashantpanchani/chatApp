const express = require('express')
const { chatRouter } = require('./routes/chatRoutes')
require('dotenv').config()
const path = require('path')
const { Server } = require("socket.io");
const { createServer } = require('http')
const app = express()
app.use('/public', express.static(path.join(__dirname, '/public')));

const httpserver = createServer(app)
const io = new Server(httpserver, {});

app.use(express.json())
app.use(express.urlencoded({ extended: true }))



const PORT = process.env.PORT || 3000

io.on('connection', (socket) => {

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
    })

})

app.use(chatRouter)
httpserver.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
}) 