const { default: mongoose } = require("mongoose");
const Media = require("../models/media");
const Message = require("../models/message");

module.exports = function chatSocket(io) {
    const users = {}
    const messageReactions = {}
    const userDisconnectTimers = {}
    const persistentUsers = {}
    io.on('connection', async (socket) => {

        socket.on('initiateChat', async (user) => {
            const wasAlreadyInRoom = persistentUsers[`${user.username}_${user.roomId}`]
            const existingTimer = userDisconnectTimers[`${user.username}_${user.roomId}`];
            if (existingTimer) {
                clearTimeout(existingTimer);
                delete userDisconnectTimers[`${user.username}_${user.roomId}`];
            }
            users[socket.id] = { username: user.username, roomId: user.roomId }
            socket.join(user.roomId)
            room = user.roomId

            persistentUsers[`${user.username}_${user.roomId}`] = true
            if (!wasAlreadyInRoom) {
                const userList = Object.values(users)
                    .filter(u => u.roomId === user.roomId)
                    .map(u => u.username);
                socket.broadcast.to(user.roomId).emit('new_user_connected', { username: user.username, userList }) //sending to all client in room except sender
            }

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
                io.to(socket.id).emit('previousMessage', messages) //send event to client with specific socket id
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
                            roomId: user.roomId,
                            status: 'sent'
                        })
                        socket.emit('chat message', { msg, message }); //sending to current socket only
                        socket.broadcast.to(user.roomId).emit('chat message_all', { msg, message })//sending to all client in room except sender
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
                        media_id: MediaMessage._id,
                        status: 'sent'
                    }
                    if (msg.messageText) {
                        messagePayload.messageText = msg.messageText
                    }
                    const message = await (await Message.create(messagePayload)).populate('media_id')
                    socket.emit('chat message', { msg, message })
                    socket.broadcast.to(user.roomId).emit('chat message_all', { msg, message })//send event to all client in room except sender
                }
            } catch (error) {
                console.log('error while creating media message', error.message)
            }
        })

        socket.on('message_delivered', async ({ messageId, senderName }) => {
            try {
                const updatedMessage = await Message.findByIdAndUpdate(messageId, { status: 'delivered' }, { new: true })
                if (updatedMessage) {
                    const senderSocketId = Object.keys(users).find(id => users[id].username === senderName)
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('update_message_status', { messageId, status: 'delivered' })
                    }
                }
            } catch (error) {
                console.error('error while message delivered', error)
            }
        })

        socket.on('message_seen', async ({ messageId, senderName }) => {
            try {
                const updatedMessage = await Message.findByIdAndUpdate(messageId, { status: 'seen' }, { new: true })
                if (updatedMessage) {
                    const senderSocketId = Object.keys(users).find(id => users[id].username === senderName)
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('update_message_status', { messageId, status: 'seen' })
                    }
                }
            } catch (error) {
                console.error('error while message seen ', error)
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
                socket.broadcast.to(user.roomId).emit('user_typing_status', data) //send event to all client in room except sender
            }
        })

        socket.on('disconnect', () => {
            const user = users[socket.id];
            if (user) {
                const userKey = `${user.username}_${user.roomId}`
                userDisconnectTimers[userKey] = setTimeout(() => {
                    const isStillConnected = Object.values(users).some(u => u.username === user.username && u.roomId === user.roomId)
                    if (!isStillConnected) {
                        socket.broadcast.to(user.roomId).emit('user_disconnected', { username: user.username }); //send event to all client in room except sender
                        delete persistentUsers[`${user.username}_${user.roomId}`]
                    }
                    delete userDisconnectTimers[userKey]
                }, 3000)
                delete users[socket.id];
            }
        })
        socket.on('toggle reaction', ({ messageId, emoji, username }) => {
            if (!messageReactions[messageId]) {
                messageReactions[messageId] = {}
            }
            if (!messageReactions[messageId][emoji]) {
                messageReactions[messageId][emoji] = [];
            }
            const userIndex = messageReactions[messageId][emoji].indexOf(username);
            if (userIndex === -1) {
                messageReactions[messageId][emoji].push(username)
            } else {
                messageReactions[messageId][emoji].splice(userIndex, 1)
            }
            io.emit('reaction updated', { messageId, reactions: messageReactions[messageId] || {} })
            async function updateMessageReactionsInDatabase(messageId, messageReactions) {
                try {
                    const updatedMessage = await Message.findByIdAndUpdate(messageId, { reactions: messageReactions })
                } catch (err) {
                    console.log('error while updating reactions in database', err)
                }
            };
            updateMessageReactionsInDatabase(messageId, messageReactions[messageId]);

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