const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
     jobtitle: String, 
     companyname: String,
     mode:{
        type: String,
        enum:['Onsite', 'Hybrid','Remote'],
     },
    location: String,
    salary: {
        min: Number,
        max: Number
    },
    description: String,
  postedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref:'user'
  }
},
     {timestamps: true} );

module.exports = mongoose.model('post', postSchema);
