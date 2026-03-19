# Backend-Frontend Connection Guide

## Current Status
- Frontend deployed on GitHub Pages: https://surajshivam-123.github.io/Campus-Sphere/
- Backend deployed on Render: https://campus-sphere-1.onrender.com

## Changes Made

### 1. Backend CORS Configuration
Updated `Backend/src/app.js` to allow requests from GitHub Pages:
```javascript
cors({
  origin: [
    "http://localhost:5173",
    "https://surajshivam-123.github.io"
  ],
  credentials: true,
})
```

### 2. Frontend API Configuration
Created `Frontend/client/src/config/api.js` to centralize API URL management.

### 3. Environment Variables
- `.env` file uses `VITE_API_URL=https://campus-sphere-1.onrender.com`
- For GitHub Actions deployment, add this as a repository secret

## Required Actions

### Step 1: Update All Frontend Files
Replace all instances of `http://localhost:3000` with `${API_URL}` in these files:

**Import statement to add at the top:**
```javascript
import API_URL from "../config/api";
```

**Files to update:**
- Frontend/client/src/pages/Register.jsx
- Frontend/client/src/pages/Profile.jsx
- Frontend/client/src/pages/ParticipateEvent/JoinEvent.jsx
- Frontend/client/src/pages/ParticipateEvent/EventDetails.jsx
- Frontend/client/src/pages/MyTeam/Myteam.jsx
- Frontend/client/src/pages/MyTeam/EventCardTeam.jsx
- Frontend/client/src/pages/MyParticipatedEvents/ParticipateateasMember.jsx
- Frontend/client/src/pages/MyParticipatedEvents/MyEvents.jsx
- Frontend/client/src/pages/MyParticipatedEvents/JoinTeam.jsx
- Frontend/client/src/pages/MyParticipatedEvents/EventCardParticipant.jsx
- Frontend/client/src/pages/MyParticipatedEvents/CricketEventDetailsPageParticipant.jsx
- Frontend/client/src/pages/JoinMember/JoinMember.jsx
- Frontend/client/src/pages/JoinMember/EventDetailsMember.jsx
- Frontend/client/src/pages/Home/Navbar.jsx
- Frontend/client/src/pages/Event Creation/CricketEventPage.jsx
- Frontend/client/src/pages/Event Creation/CreateEvent.jsx
- Frontend/client/src/pages/EditEvent/UpdateEvent.jsx
- Frontend/client/src/components/getsingleevent.jsx
- Frontend/client/src/components/getallEveNt.jsx

### Step 2: Add Environment Variable to GitHub Actions
Add the VITE_API_URL to your GitHub Actions workflow:

In `.github/workflows/deploy-frontend.yml`, add before the build step:
```yaml
- name: Create .env file
  working-directory: ./Frontend/client
  run: echo "VITE_API_URL=https://campus-sphere-1.onrender.com" > .env
```

### Step 3: Deploy Backend Changes
Push the backend CORS changes to your Render deployment:
```cmd
git add Backend/src/app.js
git commit -m "Update CORS for GitHub Pages"
git push
```

### Step 4: Test the Connection
After deploying:
1. Open browser console on your GitHub Pages site
2. Try logging in
3. Check for CORS errors
4. Verify API calls are going to the Render URL

## Troubleshooting

### CORS Errors
If you see CORS errors, verify:
- Backend CORS includes `https://surajshivam-123.github.io`
- Credentials are set to `true` on both ends
- Backend is deployed and running on Render

### API Not Found (404)
- Verify the Render backend URL is correct
- Check if Render service is sleeping (free tier sleeps after inactivity)
- Test the API directly: https://campus-sphere-1.onrender.com/api/cpsh/events/get-all-events

### Environment Variables Not Working
- Ensure `.env` file has `VITE_API_URL` (not `REACT_APP_`)
- Vite requires the `VITE_` prefix for environment variables
- Rebuild the frontend after changing `.env`
