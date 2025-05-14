const { default: mongoose } = require("mongoose");

const messageSchema = new mongoose.Schema({
    messageText: {
        type: String,
    },
    timestamp: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    roomId: String,
    // {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Room'
    // }
    media_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' }

})
const Message = mongoose.model('Message', messageSchema)
module.exports = Message