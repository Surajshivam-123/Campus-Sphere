import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";

/**
 * Middleware to validate request data against a schema
 * @param {Object} schema - Validation schema (Zod, Joi, etc.)
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request body, query, and params
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      // Handle validation errors
      const errors = error.errors?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })) || [];

      next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Validation failed",
          errors
        )
      );
    }
  };
};
