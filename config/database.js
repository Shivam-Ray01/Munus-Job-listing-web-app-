const { default: mongoose } = require("mongoose")

const connectDB = async ( )=>{
    mongoose.connect (process.env.MONGO_URI)
    console.log('MongoDB connected successfully');
};

module.exports = connectDB;
