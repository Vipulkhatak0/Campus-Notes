# College Notes Sharing Platform

A modern MERN (MongoDB, Express, React, Node.js) stack application that enables college students to share academic notes, discover resources, and build learning communities.

## Features

### Core Features
- **User Authentication**: Secure signup and login with JWT tokens
- **Notes Management**: Create, edit, delete, and browse notes
- **Note Interactions**: Like, comment, and download notes
- **Advanced Search**: Search notes, users, and groups with filtering
- **Study Groups**: Create and join study groups for collaborative learning
- **User Profiles**: View user profiles with notes and followers
- **Admin Dashboard**: Moderation tools and platform analytics

### Technical Features
- Dark theme UI with responsive design
- Real-time updates with client-side caching
- Role-based access control (User, Moderator, Admin)
- Content moderation system
- Pagination for large datasets

## Project Structure

### Frontend (Next.js 16)
```
app/
├── page.tsx                 # Home page
├── login/                   # Login page
├── signup/                  # Signup page
├── dashboard/               # User dashboard
├── notes/
│   ├── page.tsx            # Browse notes
│   ├── [id]/page.tsx       # View single note
│   └── create/page.tsx     # Create note
├── search/                  # Search page
├── groups/                  # Groups browsing
├── my-notes/                # User's notes
├── admin/                   # Admin dashboard
├── profile/                 # User profile
└── layout.tsx               # Root layout

components/
├── Navigation.tsx           # Top navigation bar
├── ProtectedRoute.tsx       # Protected route wrapper
├── NoteCard.tsx             # Note card component
└── ui/                      # Shadcn UI components

lib/
├── api.ts                   # API client and endpoints
└── utils.ts                 # Utility functions

hooks/
├── useAuth.ts               # Authentication hook
└── use-toast.ts             # Toast notifications hook
```

### Backend (Node.js + Express)
```
backend/
├── server.js                # Main server file
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   ├── Notes.js             # Notes schema
│   ├── Group.js             # Group schema
│   └── Comment.js           # Comment schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── notes.js             # Notes CRUD routes
│   ├── groups.js            # Groups routes
│   ├── search.js            # Search routes
│   └── admin.js             # Admin routes
├── middleware/
│   ├── auth.js              # JWT verification
│   └── validation.js        # Input validation
└── package.json             # Backend dependencies
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- pnpm or npm

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/college-notes
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

Create a `.env.local` file in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Installation & Running

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

#### Frontend Setup
```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/user/:id` - Get user by ID
- `POST /api/auth/follow/:id` - Follow a user
- `POST /api/auth/unfollow/:id` - Unfollow a user

### Notes Endpoints
- `GET /api/notes` - Get all notes with pagination
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note (requires auth)
- `PUT /api/notes/:id` - Update note (requires auth)
- `DELETE /api/notes/:id` - Delete note (requires auth)
- `POST /api/notes/:id/like` - Like a note
- `POST /api/notes/:id/unlike` - Unlike a note
- `POST /api/notes/:id/comments` - Add comment
- `POST /api/notes/:id/download` - Record download

### Groups Endpoints
- `GET /api/groups` - Get all public groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups` - Create group (requires auth)
- `PUT /api/groups/:id` - Update group (creator only)
- `DELETE /api/groups/:id` - Delete group (creator only)
- `POST /api/groups/:id/join` - Join a group
- `POST /api/groups/:id/leave` - Leave a group
- `GET /api/groups/:id/notes` - Get group notes

### Search Endpoints
- `GET /api/search?q=query` - Global search
- `GET /api/search/notes/advanced` - Advanced note filtering
- `GET /api/search/trending` - Trending notes
- `GET /api/search/top-authors` - Top authors
- `GET /api/search/popular-subjects` - Popular subjects

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Change user role
- `GET /api/admin/notes/flagged` - Get flagged notes
- `POST /api/admin/notes/:id/flag` - Flag a note
- `PUT /api/admin/notes/:id/moderation` - Approve/reject note

## Authentication Flow

1. User signs up with email, username, and password
2. Backend validates and hashes password
3. JWT token is generated and stored in localStorage
4. Token is included in Authorization header for protected routes
5. Frontend authenticates routes and shows content based on user role

## Data Models

### User
- username, email, password (hashed)
- fullName, college, branch, semester
- avatar, bio, role
- followers, following arrays
- notesCount, timestamps

### Notes
- title, description, content
- author (User reference)
- subject, semester, branch
- category, tags
- likes, comments, views, downloads
- fileUrl, fileName, fileSize
- isFlagged, isPublished, timestamps

### Group
- name, description, avatar
- creator (User reference)
- members (User array)
- college, branch, subject, semester
- membersCount, notesCount
- isPublic, timestamps

### Comment
- text, author
- notes (Note reference)
- likes, replies
- timestamps

## Security Considerations

- Passwords are hashed using bcryptjs
- JWT tokens with expiration time
- Input validation on all routes
- CORS enabled for frontend communication
- Role-based access control
- Admin verification for sensitive operations

## Future Enhancements

- Real-time notifications with Socket.io
- File upload support with cloud storage
- Email verification
- Password reset functionality
- Advanced analytics dashboard
- Mobile app
- Video content support
- AI-powered content recommendations
- Peer rating system

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network access if using Atlas

### API Not Connecting
- Ensure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend

### Authentication Issues
- Clear localStorage and try logging in again
- Verify JWT_SECRET is the same in backend
- Check token expiration time

## Contributing

To contribute to this project:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - Feel free to use this project for learning and personal projects.

## Support

For issues or questions, please create an issue on the GitHub repository or contact the development team.

---

Built with ❤️ for collaborative learning
