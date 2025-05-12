const { default: mongoose } = require("mongoose");

const messageSchema = new mongoose.Schema({
    messageText: {
        type: String,
        require: true,
    },
    timestamp: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
    },
    roomId: Number
    // {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Room'
    // }

})
const Message = mongoose.model('Message', messageSchema)
module.exports = Message