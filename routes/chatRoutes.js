const express = require('express')
const { homeController, chatRoomController } = require('../controllers/chatController')
const chatRouter = express.Router()

chatRouter.get('/', homeController)
chatRouter.get('/chat', chatRoomController)
module.exports = { chatRouter }