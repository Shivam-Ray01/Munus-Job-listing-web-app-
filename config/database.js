const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 10000
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.log('MongoDB connection error:', err.message);
     
    }
}

module.exports = connectDB;
