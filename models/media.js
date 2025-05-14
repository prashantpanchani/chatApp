const { default: mongoose } = require("mongoose");
const mediaSchema = new mongoose.Schema({
    url: {
        type: String,
        requireq: true,
    },
    media_type: {
        type: String
    }
})
const Media = mongoose.model('Media', mediaSchema)
module.exports = Media