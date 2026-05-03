require('dotenv').config();
const connectDB = require('./config/database');
connectDB();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const { isLoggedIn, isRecruiter, isAdmin } = require('./middleware/authmiddleware');
const users = require('./models/user');
const post = require('./models/jobpost');
const application = require('./models/application');
const path = require('path');
const cookieparser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const upload = require('./config/multer');
const transporter = require('./config/nodemailer');
const otpModel = require('./models/OTP');

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

app.get('/editjob/:id', isLoggedIn, isRecruiter, async (req, res) => {
    let job = await post.findById(req.params.id);
      if (!job){
        return res.status(403).send('job not found')
      };
    
    if (job.postedBy.toString() !== req.user.userid.toString()) {
        return res.status(403).send('Access Denied');
    }

    res.render('editjob', { job });
});

app.get('/apply/:id', isLoggedIn, async (req, res)=>{
        let job = await post.findById(req.params.id);
        res.render('apply', { job });
});

app.get('/profile', isLoggedIn , async (req, res)=>{
    let loggedInUsers = await users.findById(req.user.userid);
    if (req.user.role === 'recruiter'){
      let jobs = await post.find({postedBy: req.user.userid})
         res.render('profile', {loggedInUsers, jobs});
    } else {
        let person = await application.find({applicant: req.user.userid}).populate('job')
         res.render('profile', {loggedInUsers , person});
    }
});

app.get('/application/:jobid' , isLoggedIn, isRecruiter , async (req, res)=>{
           let job = await post.findById(req.params.jobid);
           if (job.postedBy.toString() !== req.user.userid.toString()){
               return res.send('Access Denied');
             };
             let forms = await application.find({job : req.params.jobid}).populate('applicant');
            res.render('application', {forms , job});       
});

app.get('/resume/:filename', isLoggedIn, isRecruiter, async (req, res) => {
    let filename = req.params.filename;
   let sheet = await application.findOne({resume: filename});
   if (!sheet) return res.status(404).send('Application not found');
    let job = await post.findById(sheet.job);
      if (!job) return res.status(404).send('Job not found');
    if (job.postedBy.toString() === req.user.userid.toString()){
        let filepath = path.join(__dirname, 'uploads/resumes', filename);
        res.sendFile(filepath); 
          }else {
        res.send('Access Denied');
    }
});

app.get('/logout' , isLoggedIn,  (req, res)=>{
         res.clearCookie('token');
         res.redirect('/');
});

app.get('/verifyotp' , (req, res)=>{
    let email = req.query.email;
      res.render('otpverification', {email});
});

app.get('/admin', isLoggedIn, isAdmin, async (req, res) => {
    let allUsers = await users.find();
    let allPosts = await post.find();
    let allApplications = await application.find();
    res.render('admin', { allUsers, allPosts, allApplications });
});

app.post('/register', async (req, res)=>{
    let {username, name ,email, password, role} = req.body;
     if (role ==='admin'){
            return res.status(400).send("Don't be smart you cannot self asssign for admin role");
       }
    let user = await users.findOne({email});
    if (user) return res.status(200).send('user already exists, go to login page');

    bcrypt.hash(password, 12 , async (err , hash)=>{
         if (err){
            return res.send('something went wrong');
       }
         let otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          
         await otpModel.create ({
               email,
               username,
               name,
               password: hash,
               role,
               code: otpCode
         });
         await transporter.sendMail({
         from: process.env.EMAIL,
         to: email,
         subject: 'Your OTP for Job Portal',
         text: `Your OTP is: ${otpCode}. Valid for 5 minutes.`
     });
           res.redirect('/verifyotp?email=' + email);
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
        let token = jwt.sign({email: user.email, userid:user._id , role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'});
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
     let {jobtitle, companyname, mode, location,  salary_min, salary_max, description} = req.body;
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

app.post('/delete', isLoggedIn, isRecruiter, async (req, res) => {
   let { postid } = req.body;
    
    let job = await post.findById(postid);
    
    if (!job) {
        return res.status(404).send('Job not found');
    }

    if (job.postedBy.toString() !== req.user.userid.toString()) {
        return res.status(403).send('Access Denied');
    }
    
    await post.findByIdAndDelete(postid);
    res.redirect('/dashboard');
});

app.post('/editjob/:id', isLoggedIn, isRecruiter, async (req, res) => {
    let { jobtitle, companyname, mode, location, salary_min, salary_max, description } = req.body;

    let job = await post.findById(req.params.id);

    if (job.postedBy.toString() !== req.user.userid.toString()) {
        return res.status(403).send('Access Denied');
    }

    await post.findByIdAndUpdate(req.params.id, {
        jobtitle,
        companyname,
        mode,
        location,
        salary: {
            min: salary_min,
            max: salary_max
        },
        description
    });

    res.redirect('/dashboard');
});

app.post('/apply/:id', isLoggedIn , upload.single('resume'), async (req , res)=>{
      let jobid = req.params.id;
      let applicantid = req.user.userid;
      let {name, email, availability } = req.body;
      let resume = req.file.filename ;
      let alreadyapplied = await application.findOne({
        job : jobid,
        applicant : applicantid
      });

      if (alreadyapplied){
        return res.send('Already applied to this job');
      }
     await application.create({
        job : jobid,
        applicant : applicantid,
        name : name,
        email: email,
        availability : availability,
        resume
    });
    res.redirect('/jobs');
});

app.post('/application/accept/:id' , isLoggedIn , isRecruiter,async (req, res)=>{
    let applydata = await application.findById(req.params.id);
    let status = await application.findByIdAndUpdate(req.params.id, {
        status : 'accepted'
    });
    res.redirect('/dashboard');       
});

app.post('/application/reject/:id' , isLoggedIn , isRecruiter,async (req, res)=>{
    let applydata = await application.findById(req.params.id);
    let status = await application.findByIdAndUpdate(req.params.id, {
        status : 'rejected'
    });
    res.redirect('/dashboard');    
});

app.post('/verifyotp', async (req, res)=>{
    let {email, code } = req.body;
    let otpdoc = await otpModel.findOne({email});
    if (!otpdoc){
        return res.send('Email not found');
    } 
    if (otpdoc.code !== code){
        return res.send('Incorrect OTP, please try again');
    }
       let newUser = await users.create({
        username: otpdoc.username,
        email: otpdoc.email,
        password: otpdoc.password,
        role: otpdoc.role
    });
   
await otpModel.findOneAndDelete({email});   

      let token = jwt.sign(
      { email: newUser.email, userid: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
     { expiresIn: '1d' }
  );
  res.cookie('token', token);
    if (newUser.role === 'recruiter'){
        res.redirect('/dashboard')
    } else {
        res.redirect('/jobs');
    }
});

app.post('/admin/delete-user/:id', isLoggedIn, isAdmin, async (req, res) => {
        await user.findByIdAndDelete(req.params.id);
      res.redirect('/admin');
});

app.post('/admin/delete-post/:id', isLoggedIn, isAdmin, async(req , res)=>{
       await post.findByIdAndDelete(req.params.id);
        res.redirect('/admin');

});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running')
});
