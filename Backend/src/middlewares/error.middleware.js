import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";

/**
 * Global error handling middleware
 * Catches all errors and sends consistent error responses
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || error?.error || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.error?.length > 0 && { errors: error.error }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
  }

  return res.status(error.statusCode).json(response);
};

/**
 * Handle 404 - Route not found
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.originalUrl} not found`
  );
  next(error);
};
