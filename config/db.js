require("dotenv").config();
const { default: mongoose } = require("mongoose")

module.exports = async function dbConnect() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`db connected to ${mongoose.connection.name}`)
    }
    catch (error) {
        console.error(error)
    }
}