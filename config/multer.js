const multer = require('multer');
const path = require ('path');

const storage = multer.diskStorage({destination: (req , file , cb)=>{
       cb (null, './uploads/resumes')
     },

      filename: (req , file , cb )=>{
            cb (null, Date.now() + '-' + file.originalname)
      }

   });

   const filefilter = (req, file , cb )=>{
    if (file.mimetype === 'application/pdf'){
        cb (null , true)
    }else{
        cb ( null , false)
    }
   };

   const upload = multer( { storage , filefilter});

   module.exports = upload;
