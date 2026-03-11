# Aarohan Platform - React Project Structure

## Project Setup

This is a standard React application for the Career Aptitude & Mentorship Platform.

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build
```

## Folder Structure

```
Directory structure:
└── ayushman-63000-aarohan/
    ├── README.md
    ├── docker-compose.yml
    ├── Dockerfile
    ├── eslint.config.js
    ├── index.html
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── .dockerignore
    ├── backend/
    │   ├── app.js
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── server.js
    │   ├── vercel.json
    │   ├── .dockerignore
    │   ├── api/
    │   │   └── index.js
    │   ├── config/
    │   │   └── db.js
    │   ├── models/
    │   │   ├── Counselor.js
    │   │   ├── Lead.js
    │   │   ├── Session.js
    │   │   ├── Student.js
    │   │   └── TestResult.js
    │   └── routes/
    │       ├── auth.js
    │       ├── counselors.js
    │       ├── leads.js
    │       ├── sessions.js
    │       └── students.js
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── res.css
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── AdminAnalytics.jsx
    │   │   │   ├── AdminAssessmentsManagement.jsx
    │   │   │   ├── AdminCounselorsManagement.jsx
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminProgramsManagement.jsx
    │   │   │   └── AdminStudentsManagement.jsx
    │   │   ├── counselor/
    │   │   │   ├── CounselorDashboard.jsx
    │   │   │   ├── CounselorProfile.jsx
    │   │   │   ├── CounselorProfileSetup.jsx
    │   │   │   ├── CounselorSessions.jsx
    │   │   │   ├── CounselorStudentsList.jsx
    │   │   │   └── StudentReportView.jsx
    │   │   ├── pages/
    │   │   │   └── LoginPage.jsx
    │   │   ├── shared/
    │   │   │   ├── EmptyState.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── Toast.jsx
    │   │   └── student/
    │   │       ├── CounselingBooking.jsx
    │   │       ├── ProfileWizard.jsx
    │   │       ├── ProgramUpgrade.jsx
    │   │       ├── ResultsDashboard.jsx
    │   │       ├── StudentDashboard.jsx
    │   │       ├── TestPlayer.jsx
    │   │       └── TestsView.jsx
    │   ├── context/
    │   │   └── AppContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── utils/
    │       ├── adminConfig.js
    │       ├── config.js
    │       ├── constants.js
    │       ├── helpers.js
    │       ├── mockData.js
    │       └── oceanEngine.js
    └── .vite/
        └── deps/
            ├── _metadata.json
            └── package.json

```

## Key Files

### Entry Points
- **public/index.html** - Main HTML file with React root
- **src/index.js** - React entry point
- **src/App.js** - Main App component with routing

### Pages
- **Banner.js** - Landing page with hero section
- **StudentLogin.js** - Student OTP login
- **CounselorLogin.js** - Counselor OTP login
- **AdminLogin.js** - Admin OTP login (hidden route)
- **StudentDashboard.js** - Student portal
- **CounselorDashboard.js** - Counselor portal
- **AdminDashboard.js** - Admin portal

### Components
- Reusable UI components (Navbar, Card, Modal, etc.)
- Form components
- Layout components

### Utilities
- **mockData.js** - Mock data for development
- **api.js** - API call functions (to be integrated with backend)
- **constants.js** - App constants
- **helpers.js** - Utility functions

## Routing

The app uses hash-based routing:
- `/` - Banner/Home
- `/student-login` - Student login
- `/counselor-login` - Counselor login
- `/admin-login` - Admin login (hidden)
- `/student-dashboard` - Student portal
- `/counselor-dashboard` - Counselor portal
- `/admin-dashboard` - Admin portal

## State Management

- React Context API for global state
- Local component state with useState
- localStorage for persistence

## Development

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Backend Integration

Replace mock API calls in `src/utils/api.js` with real API endpoints.

## Environment Variables

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

Backend environment variables (in backend runtime):
```
MONGODB_URI=your_mongo_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/sheets/oauth/callback
GOOGLE_SHEET_ID=optional_existing_sheet_id
EMAIL_USER=optional_email_user
EMAIL_PASS=optional_email_app_password
GEMINI_API_KEY=optional_gemini_key
```

After setting the Google OAuth values, visit:
```
/sheets/oauth/ui
```
and click "Connect Google Account" once to enable Google Meet link creation.

## Features

✅ OTP Authentication
✅ Multi-role system (Student, Counselor, Admin)
✅ Profile management
✅ Aptitude testing
✅ Results dashboard
✅ Career mentorship booking
✅ Program upgrades
✅ Session management
✅ Analytics & reporting

## Technologies

- React 18
- Modern JavaScript (ES6+)
- CSS3 with CSS Variables
- Context API
- localStorage API

## License

Private Project
