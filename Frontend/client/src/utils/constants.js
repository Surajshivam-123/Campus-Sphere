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
  USERS: "/api/v1/users",
  EVENTS: "/api/v1/events",
  PARTICIPANTS: "/api/v1/participants",
  MEMBERS: "/api/v1/members",
  TEAMS: "/api/v1/teams",
  CRICKET_PLAYERS: "/api/v1/cricket-players",
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
