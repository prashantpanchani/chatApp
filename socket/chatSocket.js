module.exports = function chatSocket(io) {
    const users = {};
    io.on('connection', (socket) => {

        socket.on('set_username', (username) => {
            users[socket.id] = username
            socket.broadcast.emit('new_user_connected', { username, users })
        })

        socket.on('chat message', (msg) => {
            io.emit('chat message', msg)
        })

        setInterval(function () {
            io.emit('online user', { users })
        }, 1000 * 60)

        //typing indicator
        socket.on('user input', (data) => {
            socket.broadcast.emit('user_typing_status', data)
        })

        socket.on('disconnect', () => {
            const username = users[socket.id];
            delete users[socket.id];
            socket.broadcast.emit('user_disconnected', { username, users });
        })

    })
}