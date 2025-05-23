const express = require('express')
const { chatRouter } = require('./routes/chatRoutes')
require('dotenv').config()
const path = require('path')
const { Server } = require("socket.io");
const { createServer } = require('http');
const chatSocket = require('./socket/chatSocket');
const dbConnect = require('./config/db');

const app = express()
const httpserver = createServer(app)
const io = new Server(httpserver, {
    maxHttpBufferSize: 1e7,
    cors: {
        origin: "*"
    }
});

dbConnect()
app.use('/public', express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 3000

chatSocket(io)

app.use(chatRouter)
httpserver.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
}) 