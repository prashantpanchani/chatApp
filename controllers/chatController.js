const path = require('path')
const homeController = (req, res) => {

    res.sendFile(path.join(__dirname, '../public/html/index.html'))

}
const chatRoomController = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/chat.html'))
}

module.exports = { homeController, chatRoomController }