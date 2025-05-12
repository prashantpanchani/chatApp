const Message = require("../models/message");

module.exports = function chatSocket(io) {
    const users = {};

    io.on('connection', (socket) => {

        socket.on('initiateChat', async (user) => {
            users[socket.id] = { username: user.username, roomId: user.roomId }
            socket.join(user.roomId)
            async function getMessage() {
                const messages = await Message.find({ roomId: user.roomId })
                    .sort({ _id: -1 })
                    .limit(20)
                return messages.reverse()
            }
            const messages = await getMessage()
            io.to(user.roomId).emit('previousMessage', messages)
            const userList = Object.values(users)
                .filter(u => u.roomId === user.roomId)
                .map(u => u.username);
            socket.broadcast.to(user.roomId).emit('new_user_connected', { username: user.username, userList })

        })




        socket.on('chat message', async (msg) => {
            const user = users[socket.id]
            if (user) {
                const message = await Message.create({
                    messageText: msg.message,
                    timestamp: msg.timestamp,
                    username: msg.username,
                    roomId: users[socket.id].roomId
                })
                io.to(user.roomId).emit('chat message', msg)

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