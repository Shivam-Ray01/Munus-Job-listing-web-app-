const jwt = require('jsonwebtoken');

const isLoggedIn = (req, res, next ) =>{
    let token = req.cookies.token;

     if (!token){
        return res.redirect('/login');
     }
     try{
     let pass = jwt.verify(req.cookies.token , process.env.JWT_SECRET);
     req.user = pass;
     next();
     } catch (err){
            return res.redirect('/login')
     } ;
};
       
     const isRecruiter = ( req, res, next)=>{
       if (req.user && req.user.role === 'recruiter' ){
         next();
       } else {
          res.status(200).send('Access Denied , only recruiters are premitted');
       }
    };

    const isAdmin =(req, res, next)=>{
        if (req.user && req.user.role === 'admin'){
            next();
        } else {
            res.status(403).send('Access Denied, only Admins are permitted');
        }

    }
    
module.exports = {isLoggedIn, isRecruiter, isAdmin };



