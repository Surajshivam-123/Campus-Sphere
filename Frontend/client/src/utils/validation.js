/**
 * Common validation functions for forms
 */

/**
 * Validate required field
 */
export const required = (value, fieldName = "This field") => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate email format
 */
export const email = (value) => {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Please enter a valid email address";
  }
  return null;
};

/**
 * Validate minimum length
 */
export const minLength = (value, min, fieldName = "This field") => {
  if (!value) return null;
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 */
export const maxLength = (value, max, fieldName = "This field") => {
  if (!value) return null;
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
};

/**
 * Validate password match
 */
export const passwordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

/**
 * Validate number range
 */
export const numberRange = (value, min, max, fieldName = "This field") => {
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

/**
 * Validate positive number
 */
export const positiveNumber = (value, fieldName = "This field") => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

/**
 * Validate date is in future
 */
export const futureDate = (value, fieldName = "This field") => {
  if (!value) return null;
  const selectedDate = new Date(value);
  const now = new Date();
  if (selectedDate <= now) {
    return `${fieldName} must be in the future`;
  }
  return null;
};

/**
 * Compose multiple validators
 */
export const compose = (...validators) => (value, fieldName) => {
  for (const validator of validators) {
    const error = validator(value, fieldName);
    if (error) return error;
  }
  return null;
};

/**
 * Validate event form
 */
export const validateEventForm = (values) => {
  const errors = {};

  // Event name
  const eventNameError = compose(
    (v) => required(v, "Event name"),
    (v) => minLength(v, 3, "Event name")
  )(values.eventName);
  if (eventNameError) errors.eventName = eventNameError;

  // Organization
  const orgError = required(values.organization, "Organization");
  if (orgError) errors.organization = orgError;

  // Description
  const descError = compose(
    (v) => required(v, "Description"),
    (v) => minLength(v, 10, "Description")
  )(values.description);
  if (descError) errors.description = descError;

  // Start date
  const dateError = compose(
    (v) => required(v, "Start date"),
    (v) => futureDate(v, "Start date")
  )(values.startDate);
  if (dateError) errors.startDate = dateError;

  // Location
  const locationError = required(values.eventLocation, "Location");
  if (locationError) errors.eventLocation = locationError;

  // Mode
  const modeError = required(values.mode, "Mode");
  if (modeError) errors.mode = modeError;

  // Category
  const categoryError = required(values.category, "Category");
  if (categoryError) errors.category = categoryError;

  // Max participants
  const maxParticipantsError = compose(
    (v) => required(v, "Max participants"),
    (v) => positiveNumber(v, "Max participants")
  )(values.maxParticipants);
  if (maxParticipantsError) errors.maxParticipants = maxParticipantsError;

  return errors;
};

/**
 * Validate login form
 */
export const validateLoginForm = (values) => {
  const errors = {};

  const usermailError = required(values.usermail, "Email or username");
  if (usermailError) errors.usermail = usermailError;

  const passwordError = required(values.password, "Password");
  if (passwordError) errors.password = passwordError;

  return errors;
};

/**
 * Validate registration form
 */
export const validateRegisterForm = (values) => {
  const errors = {};

  const fullnameError = compose(
    (v) => required(v, "Full name"),
    (v) => minLength(v, 2, "Full name")
  )(values.fullname);
  if (fullnameError) errors.fullname = fullnameError;

  const usernameError = compose(
    (v) => required(v, "Username"),
    (v) => minLength(v, 3, "Username")
  )(values.username);
  if (usernameError) errors.username = usernameError;

  const emailError = compose(
    (v) => required(v, "Email"),
    email
  )(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = compose(
    (v) => required(v, "Password"),
    (v) => minLength(v, 6, "Password")
  )(values.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = passwordMatch(values.password, values.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
};
