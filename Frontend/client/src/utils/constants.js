/**
 * Application Constants
 */

// Event Types
export const EVENT_TYPES = {
  CRICKET: "cricket",
  CULTURAL: "cultural",
  WORKSHOP: "workshop",
  SPORTS: "sports",
};

// API Endpoints
export const API_ENDPOINTS = {
  USERS: "/api/cpsh/users",
  EVENTS: "/api/cpsh/events",
  PARTICIPANTS: "/api/cpsh/participants",
  MEMBERS: "/api/cpsh/members",
  TEAMS: "/api/cpsh/teams",
  CRICKET_PLAYERS: "/api/cpsh/cricket-players",
};

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  EVENTS: "/events",
  CREATE_EVENT: "/create-event",
  MY_EVENTS: "/my-events",
  MY_TEAM: "/my-team",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER: "user",
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
};
