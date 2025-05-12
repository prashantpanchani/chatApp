const { default: mongoose } = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomId: Number,
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
})

const Room = mongoose.model('Room', roomSchema);
module.exports = Room