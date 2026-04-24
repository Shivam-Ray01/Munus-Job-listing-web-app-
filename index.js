require('dotenv').config();
const connectDB = require('./config/database');
connectDB();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const { isLoggedIn, isRecruiter, isAdmin } = require('./middleware/authmiddleware');
const users = require('./models/user');
const post = require('./models/jobpost');
const path = require('path');
const cookieparser = require('cookie-parser');
const jwt = require('jsonwebtoken');


app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieparser());


app.get('/' , (req , res) => {
    res.render('index');
});

app.get('/login' , (req , res)=>{
    res.render('login')
});

app.get('/register', (req , res)=>{
    res.render('register');
});

app.get('/profile', isLoggedIn,  (req,res)=>{
   res.render('profile')
});

app.get('/postjobs' ,isLoggedIn, isRecruiter, (req, res)=>{
    res.render('postjobs');
});

app.get('/jobs', isLoggedIn, async (req , res)=>{
    let jobs = await post.find();
    res.render('jobs', {jobs});
});

app.get('/dashboard', isLoggedIn, isRecruiter,  async (req, res)=>{
    let jobs = await post.find({postedBy: req.user.userid});
    res.render('dashboard', {jobs});
});

app.post('/register', async (req, res)=>{
    let {username, email, password, role} = req.body;
     if (role ==='admin'){
            return res.status(400).send("Don't be smart you cannot self asssign for admin role");
       }
    let user = await users.findOne({email});
    if (user) return res.status(200).send('user already exists, go to login page');

    bcrypt.hash(password, 12 , async (err , hash)=>{
         if (err){
            return res.send('something went wrong');
       }
        let user = await users.create ({
            username,
            email,
            password: hash,
            role,
        });
       let token =  jwt.sign({email:email , userid: user._id, role:user.role}, process.env.JWT_SECRET, {expiresIn: '1d'});
            res.cookie('token', token);
            res.render('login');
            });
});

app.post('/login' , async (req , res)=> {
      let {email, password} = req.body;
      let user = await users.findOne({email});
    if (!user){
        return res.status(200).send('Account not registered, Register first to login');
      }
           
         bcrypt.compare(password, user.password, (err , result)=>{
            if (result){
        let token = jwt.sign({email: user.email, user:user._id , role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.cookie('token', token);
           if (user.role === 'recruiter'){
            res.redirect('/dashboard')
           } else if (user.role === 'admin'){
                res.redirect('/admin')
           }else{
            res.redirect('/jobs');
           }
     } else {
        res.status(400).send('Something went wrong');
        };
    });
});

app.post('/postjobs', isLoggedIn , isRecruiter, async (req, res)=>{
     let {jobtitle, companyname, location,  salary_min, salary_max, description} = req.body;
      await post.create( {
        jobtitle, 
        companyname, 
        location, 
        salary: {
            min: salary_min,
            max: salary_max
        },
        description, 
        postedBy: req.user.userid
     });
     res.redirect('/dashboard');
});

app.post('/delete', isLoggedIn, isRecruiter, async (req , res) => {
   let {postid} = req.body;
    await post.findByIdAndDelete(postid);
        res.redirect('/dashboard');
});


app.listen(3000);



