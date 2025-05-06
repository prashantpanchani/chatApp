module.exports = function chatSocket(io) {
    const users = {};

    io.on('connection', (socket) => {

        socket.on('initiateChat', (user) => {
            users[socket.id] = { username: user.username, roomId: user.roomId }
            // console.log(users[socket.id])
            socket.join(user.roomId)
            const userList = Object.values(users)
                .filter(u => u.roomId === user.roomId)
                .map(u => u.username);
            socket.broadcast.to(user.roomId).emit('new_user_connected', { username: user.username, userList })

        })




        socket.on('chat message', (msg) => {
            console.log(msg)
            const user = users[socket.id]
            if (user) {
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