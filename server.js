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
const users = {}
io.on('connection', (socket) => {
    socket.on('set_username', (username) => {
        users[socket.id] = username
        socket.broadcast.emit('new_user_connected', { username })
    })
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
    })
    socket.on('disconnect', () => {
        const username = users[socket.id];
        socket.broadcast.emit('user_disconnected', { username });
    })

})

app.use(chatRouter)
httpserver.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
}) 