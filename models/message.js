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
    media_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' }
    ,
    status: String
})
const Message = mongoose.model('Message', messageSchema)
module.exports = Message