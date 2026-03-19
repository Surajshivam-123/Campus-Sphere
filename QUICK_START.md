# Campus Sphere - Quick Start Guide

## 🚀 Getting Started with the Improved Codebase

This guide will help you understand and use the newly implemented best practices in the Campus Sphere project.

---

## 📁 New Project Structure

```
Campus-Sphere/
├── Backend/
│   ├── src/
│   │   ├── config/          # ✨ NEW: Centralized configuration
│   │   ├── constants/       # ✨ NEW: Application constants
│   │   ├── controllers/     # ✅ IMPROVED: Thin controllers
│   │   ├── db/              # ✅ IMPROVED: Better DB connection
│   │   ├── middlewares/     # ✨ NEW: Error & validation middlewares
│   │   ├── models/          # Existing models
│   │   ├── routes/          # Existing routes
│   │   ├── services/        # ✨ NEW: Business logic layer
│   │   └── utils/           # Existing utilities
│   └── .env.example         # ✨ NEW: Environment template
│
├── Frontend/
│   └── client/
│       └── src/
│           ├── hooks/       # ✨ NEW: Custom React hooks
│           ├── services/    # ✨ NEW: API service layer
│           └── utils/       # ✨ NEW: Helper functions & constants
│
└── Documentation/
    ├── BEST_PRACTICES_GUIDE.md      # ✨ NEW: Comprehensive guide
    ├── IMPROVEMENTS_SUMMARY.md      # ✨ NEW: What changed
    └── QUICK_START.md               # ✨ NEW: This file
```

---

## 🔧 Setup Instructions

### 1. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your actual values
# - MONGODB_URI
# - JWT secrets
# - Cloudinary credentials
# - Frontend URLs

# Start the server
npm start
```

### 2. Frontend Setup

```bash
cd Frontend/client

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env

# Start development server
npm run dev
```

---

## 💡 Key Concepts

### 1. Service Layer Pattern

**What**: Business logic separated from controllers

**Why**: Reusable, testable, maintainable code

**Example**:
```javascript
// ❌ Old way - Logic in controller
const registerUser = async (req, res) => {
  const user = await User.create(req.body);
  const token = jwt.sign({ id: user._id }, secret);
  // ... more logic
};

// ✅ New way - Delegate to service
const registerUser = asyncHandler(async (req, res) => {
  const result = await userService.registerUser(req.body, req.file?.path);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result.user, "User registered")
  );
});
```

### 2. Centralized Configuration

**What**: All config in one place

**Why**: Easy to manage, validate, and update

**Example**:
```javascript
// ❌ Old way
const port = process.env.PORT;
const dbUri = process.env.MONGODB_URI;

// ✅ New way
import { config } from "./config/index.js";
const port = config.server.port;
const dbUri = config.mongodb.uri;
```

### 3. Constants

**What**: Named constants instead of magic values

**Why**: Consistent, readable, maintainable

**Example**:
```javascript
// ❌ Old way
res.status(200).json({ success: true });

// ✅ New way
res.status(HTTP_STATUS.OK).json(
  new ApiResponse(HTTP_STATUS.OK, data, "Success")
);
```

### 4. API Service Layer (Frontend)

**What**: Centralized API client with interceptors

**Why**: Automatic token refresh, error handling, consistent calls

**Example**:
```javascript
// ❌ Old way
const response = await axios.get(`${API_URL}/users/profile`, {
  headers: { Authorization: `Bearer ${token}` }
});

// ✅ New way
import apiClient from "./services/api.service";
const response = await apiClient.get("/api/v1/users/profile");
// Token automatically added, errors handled globally
```

---

## 🎯 Common Tasks

### Adding a New Feature

1. **Create Service** (if needed)
```javascript
// Backend/src/services/event.service.js
class EventService {
  async createEvent(eventData) {
    // Business logic here
  }
}
export default new EventService();
```

2. **Create/Update Controller**
```javascript
// Backend/src/controllers/event.controller.js
import eventService from "../services/event.service.js";

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, event, "Event created")
  );
});
```

3. **Add Route**
```javascript
// Backend/src/routes/event.route.js
router.post("/", verifyJWT, createEvent);
```

4. **Create Frontend Service**
```javascript
// Frontend/client/src/services/event.service.js
import apiClient from "./api.service";

class EventService {
  async createEvent(eventData) {
    return apiClient.post("/api/v1/events", eventData);
  }
}
export default new EventService();
```

---

## 🔍 Code Examples

### Backend: Creating a New Service

```javascript
// Backend/src/services/team.service.js
import { Team } from "../models/team.model.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";

class TeamService {
  async createTeam(teamData, userId) {
    // Validate team doesn't exist
    const existingTeam = await Team.findOne({ name: teamData.name });
    if (existingTeam) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Team already exists");
    }

    // Create team
    const team = await Team.create({
      ...teamData,
      createdBy: userId,
    });

    return team;
  }

  async getTeamById(teamId) {
    const team = await Team.findById(teamId).populate("members");
    if (!team) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Team not found");
    }
    return team;
  }
}

export default new TeamService();
```

### Frontend: Using the Auth Hook

```javascript
// Frontend/client/src/pages/Login.jsx
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

function Login() {
  const { login, error, loading } = useAuth();
  const [credentials, setCredentials] = useState({
    usermail: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      // Redirect to home
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

---

## 🐛 Debugging Tips

### Backend

1. **Check logs**: Look for error messages in console
2. **Verify config**: Ensure .env variables are set correctly
3. **Test endpoints**: Use Postman or Thunder Client
4. **Check database**: Verify MongoDB connection

### Frontend

1. **Check console**: Look for errors in browser console
2. **Check network**: Inspect API calls in Network tab
3. **Verify API URL**: Ensure VITE_API_URL is correct
4. **Check auth**: Verify token is being sent

---

## 📚 Additional Resources

- **BEST_PRACTICES_GUIDE.md**: Comprehensive best practices
- **IMPROVEMENTS_SUMMARY.md**: Detailed list of changes
- **DEPLOYMENT_GUIDE.md**: Deployment instructions

---

## ✅ Checklist for New Developers

- [ ] Read BEST_PRACTICES_GUIDE.md
- [ ] Set up backend with .env file
- [ ] Set up frontend with .env file
- [ ] Test user registration
- [ ] Test user login
- [ ] Understand service layer pattern
- [ ] Understand API service layer
- [ ] Review existing code examples
- [ ] Try creating a new feature

---

## 🤝 Need Help?

1. Check the documentation files
2. Review code examples
3. Look at existing implementations
4. Ask team members

---

**Happy Coding! 🚀**
