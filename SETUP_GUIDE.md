# College Notes Sharing Platform - Setup Guide

This guide will help you set up and run the College Notes Sharing Platform on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas account) - [Download Local](https://www.mongodb.com/try/download/community) or [Cloud](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- A code editor (VS Code recommended)

## Quick Start (5 minutes)

### Step 1: MongoDB Setup

#### Option A: MongoDB Atlas (Recommended for beginners)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier available)
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/college-notes`
5. Copy this for later use

#### Option B: Local MongoDB
1. Install MongoDB Community Edition
2. Start the MongoDB service
3. Connection string: `mongodb://localhost:27017/college-notes`

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB connection string
# MONGODB_URI=your_connection_string_here

# Install dependencies
npm install

# Start the backend server
npm run dev
```

You should see: `Server is running on port 5000`

### Step 3: Frontend Setup

In a **new terminal** window:

```bash
# From the project root directory
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local if needed (defaults should work)
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start the frontend development server
npm run dev
```

You should see: `Ready in X.XXs`

### Step 4: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health

## Complete Setup Instructions

### Backend Configuration

1. **Create `.env` file in `/backend` directory:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/college-notes
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-notes

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Start the backend server:**
```bash
npm run dev
```

The server will start on `http://localhost:5000`. You should see:
```
MongoDB Connected: localhost
Server is running on port 5000
```

### Frontend Configuration

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Create `.env.local` file in the root directory:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Start the development server:**
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`. You should see:
```
Ready in X.XXs
```

## Testing the Setup

### 1. Test Backend API
```bash
curl http://localhost:5000/health
# Should return: {"status":"API is running"}
```

### 2. Create a Test Account
1. Go to http://localhost:3000
2. Click "Get Started" or navigate to `/signup`
3. Fill in the form:
   - Full Name: Test User
   - Username: testuser
   - Email: test@example.com
   - Password: password123
   - College: Test College
   - Branch: Computer Science

4. Click "Create Account"

### 3. Test Main Features
- **Dashboard**: Navigate to `/dashboard` (after login)
- **Browse Notes**: Go to `/notes`
- **Create Note**: Click "Create New Note"
- **Search**: Use the search functionality

## Troubleshooting

### Backend Won't Start

**Error: `MongoDB Connection Error`**
- Verify MongoDB is running: `mongosh` (MongoDB Shell)
- Check MONGODB_URI in .env file
- For Atlas, ensure IP whitelist includes your computer

**Error: `Port 5000 already in use`**
- Change PORT in .env to another port (e.g., 5001)
- Or kill the process using port 5000:
  - Windows: `netstat -ano | findstr :5000`
  - Mac/Linux: `lsof -i :5000`

### Frontend Won't Start

**Error: `Port 3000 already in use`**
- The frontend will automatically use the next available port
- Or kill the process using port 3000

**Error: `API connection failed`**
- Ensure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Clear browser cache and localStorage

### Database Issues

**Error: `Database does not exist`**
- This is normal! MongoDB creates it automatically on first use
- Your collections will be created when you create first data

**Error: `Authentication failed`**
- Check your MongoDB username and password
- For Atlas, ensure connection string format is correct

## Project Structure Overview

```
project/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── dashboard/               # User dashboard
│   ├── notes/                   # Notes pages
│   ├── search/                  # Search page
│   ├── groups/                  # Groups page
│   ├── admin/                   # Admin dashboard
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── Navigation.tsx           # Navigation component
│   ├── ProtectedRoute.tsx       # Protected routes
│   ├── NoteCard.tsx             # Note card component
│   └── ui/                      # Shadcn UI components
├── lib/
│   ├── api.ts                   # API client
│   └── utils.ts                 # Utilities
├── hooks/
│   ├── useAuth.ts               # Auth hook
│   └── use-toast.ts             # Toast hook
├── backend/                     # Express backend
│   ├── server.js                # Main server
│   ├── package.json             # Backend dependencies
│   ├── config/                  # Configuration
│   ├── models/                  # MongoDB models
│   ├── routes/                  # API routes
│   └── middleware/              # Middleware
├── package.json                 # Frontend dependencies
└── README.md                    # Documentation
```

## Understanding the Application Flow

### User Registration & Login
1. User fills signup form with credentials
2. Frontend validates input
3. Request sent to `/api/auth/signup` endpoint
4. Backend hashes password and creates user
5. JWT token returned and stored in localStorage
6. User redirected to dashboard

### Creating & Viewing Notes
1. User navigates to "Create New Note"
2. Fills form with note details (title, subject, content, etc.)
3. Frontend sends POST request to `/api/notes`
4. Backend creates note with user as author
5. Note becomes visible in "Browse Notes" and "My Notes"
6. Other users can like, comment, and download

### Admin Features
1. Admin user (role='admin') can access `/admin`
2. Dashboard shows platform statistics
3. Can view and moderate flagged content
4. Can change user roles and manage users

## Development Tips

### Useful Commands

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter

**Backend:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- Node script files for database seeding (add your own)

### Using the API

Open Postman or Insomnia to test API endpoints:

```
GET http://localhost:5000/api/notes
POST http://localhost:5000/api/auth/login
  Body: {"email":"test@example.com","password":"password123"}
```

## Next Steps

1. **Explore the codebase**: Understand the project structure
2. **Create some test data**: Add notes and groups through the UI
3. **Read API documentation**: Check README.md for API endpoints
4. **Customize**: Modify colors, add features, adapt to your needs
5. **Deploy**: Use Vercel for frontend and Heroku/Railway for backend

## Deployment

### Deploy Frontend (Vercel)
```bash
npm run build
# Then push to GitHub and connect to Vercel
```

### Deploy Backend
Options: Heroku, Railway, AWS, DigitalOcean
Set production environment variables and connect to cloud MongoDB

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Express Docs**: https://expressjs.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **shadcn/ui**: https://ui.shadcn.com/

## Common Questions

**Q: Can I use this for production?**
A: This is a learning project. For production, add: input validation, rate limiting, error handling, logging, and security headers.

**Q: How do I add file uploads?**
A: Install multer, add file handling in backend, and implement upload form in frontend.

**Q: How do I deploy both frontend and backend?**
A: Frontend → Vercel, Backend → Railway/Heroku. Set correct API URL in frontend env.

Happy coding! If you have questions, refer to the README.md file for more detailed information.
