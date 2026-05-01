# Munus — Opportunities That Actually Fit.

A full-stack job portal that connects job seekers with recruiters through a clean, role-based platform. Built from scratch using Node.js, Express, MongoDB, and EJS.

📁 **GitHub:** github.com/Shivam-Ray01/Munus-Job-listing-web-app-

---

## What is Munus?

Munus is a job portal where recruiters post opportunities, job seekers apply with their resume, and an admin manages the platform. It handles real-world concerns like secure file access, email verification, and role-based permissions — not just a tutorial CRUD app.

---

## Features

### For Job Seekers
- Register with email OTP verification
- Browse all active job listings
- Apply with name, availability, and PDF resume upload
- Track application status (Pending / Accepted / Rejected) from profile

### For Recruiters
- Post, edit, and delete job listings
- View all applications received for each job
- Accept or reject applicants
- Resume access restricted — only the recruiter who owns the job can view applicant resumes

### For Admins
- View all users, job posts, and applications platform-wide
- Delete any user or job post
- Live stats — total users, posts, and applications at a glance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt, cookie-parser |
| Email | Nodemailer (Gmail SMTP) |
| File Uploads | Multer |
| Frontend | EJS, Tailwind CSS, Custom CSS |
| Environment | dotenv |

---

## Project Structure

```
munus/
├── config/
│   ├── database.js       # MongoDB connection
│   ├── multer.js         # File upload config
│   └── nodemailer.js     # Email transporter
├── middleware/
│   └── authMiddleware.js # isLoggedIn, isRecruiter, isAdmin
├── models/
│   ├── user.js           # User schema
│   ├── jobpost.js        # Job post schema
│   ├── application.js    # Application schema
│   └── OTP.js            # OTP schema with TTL auto-expiry
├── uploads/
│   └── resumes/          # Protected PDF storage (outside public)
├── public/
│   ├── css/              # Custom stylesheets
│   └── images/           # Static assets
├── views/                # EJS templates
├── .env                  # Environment variables (not pushed)
├── .gitignore
└── index.js              # Main server file
```

## How It Works

```
Register → Email OTP Verification → Account Created
    ↓
Login → JWT Token (stored in cookie)
    ↓
Role Check (User / Recruiter / Admin)
    ↓
Job Seeker → Browse Jobs → Apply (upload resume)
Recruiter  → Post Jobs → View Applications → Accept / Reject
Admin      → Manage everything
```

---

## Security Highlights

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT tokens expire after **1 day**
- Email verified via **OTP before account creation**
- OTP auto-expires after **5 minutes** using MongoDB TTL index
- Resume files stored **outside the public folder** — served only through authenticated, ownership-verified routes
- Admin self-assignment blocked at registration level

---

## Author

**Shivam Ray**  
📧 shivamray71205@gmail.com  
🔗 [LinkedIn](www.linkedin.com/in/shivam-ray-33b61126a/)  
💻 [GitHub](github.com/Shivam-Ray01)
