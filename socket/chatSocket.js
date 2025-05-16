const { default: mongoose } = require("mongoose");
const Media = require("../models/media");
const Message = require("../models/message");

module.exports = function chatSocket(io) {
    const users = {};

    io.on('connection', async (socket) => {
        let room;
        socket.on('initiateChat', async (user) => {
            users[socket.id] = { username: user.username, roomId: user.roomId }
            socket.join(user.roomId)
            room = user.roomId

            const userList = Object.values(users)
                .filter(u => u.roomId === user.roomId)
                .map(u => u.username);
            socket.broadcast.to(user.roomId).emit('new_user_connected', { username: user.username, userList })
        })
        socket.on('userJoin', async (user) => {
            try {
                async function getMessage() {
                    if (user) {
                        const messages = await Message.find({ roomId: user.roomId })
                            .sort({ _id: -1 })
                            .limit(20).populate('media_id')
                        return messages.reverse()
                    }
                }
                const messages = await getMessage()
                io.to(socket.id).emit('previousMessage', messages)
            } catch (error) {
                console.log('error getting chat message from database', error.message)
            }

        })

        socket.on('chat message', async (msg) => {
            try {


                const user = users[socket.id]
                if (user) {
                    if (!msg.fileUrl) {
                        const message = await Message.create({
                            messageText: msg.messageText,
                            timestamp: msg.timestamp,
                            username: msg.username,
                            roomId: user.roomId
                        })
                        io.to(user.roomId).emit('chat message', { msg, message })
                    }
                }
            } catch (error) {
                console.log('error creating chat message in database', error)
            }
        })
        socket.on('media upload', async (msg) => {
            try {
                const user = users[socket.id]
                if (user) {
                    let url = msg.fileUrl
                    const roomId = users[socket.id].roomId
                    const MediaMessage = await Media.create({
                        url: msg.fileUrl,
                        media_type: (url.includes('video') ? 'video' : 'image')
                    })
                    const messagePayload = {
                        timestamp: msg.timestamp,
                        username: msg.username,
                        roomId: roomId,
                        media_id: MediaMessage._id
                    }
                    if (msg.messageText) {
                        messagePayload.messageText = msg.messageText
                    }
                    const message = await (await Message.create(messagePayload)).populate('media_id')
                    io.to(user.roomId).emit('chat message', { msg, message })
                }
                // io.to(user.roomId).emit('chat message', msg)
            } catch (error) {
                console.log('error while creating media message', error.message)
            }
        })

        socket.on('delete message', async (message) => {
            try {
                if (message.media_id) {
                    const deletedMedia = await Media.findOneAndDelete({ _id: message.media_id._id })
                }
                const deletedMessage = await Message.findByIdAndDelete(message._id)
            } catch (error) {
                console.log('error while deleting message', error)
            }
        })

        //typing indicator
        socket.on('user input', (data) => {
            const user = users[socket.id]
            if (user) {
                socket.broadcast.to(user.roomId).emit('user_typing_status', data)
            }
        })

        socket.on('disconnect', () => {
            const user = users[socket.id];
            if (user) {
                socket.broadcast.to(user.roomId).emit('user_disconnected', { username: user.username });
                delete users[socket.id];
            }
        })
    })

    setInterval(function () {
        const roomUsers = {}
        for (const { roomId, username } of Object.values(users)) {
            if (!roomUsers[roomId]) roomUsers[roomId] = []
            roomUsers[roomId].push(username)
        }
        for (const [roomId, userList] of Object.entries(roomUsers)) {
            io.to(roomId).emit('online user', { userList })
        }
    }, 1000 * 60)
}