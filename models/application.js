const mongoose = require('mongoose');

const application = mongoose.Schema({

    job :{
        type: mongoose.Schema.Types.ObjectId,
        ref:'post'
    },

    applicant:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default:'pending',
    }
}, {timestamps:true});

module.exports = mongoose.model('application', application);

