export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, "VALIDATION_ERROR", message, details);
export const unauthorized = (message = "Authentication required") => new AppError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "Access denied") => new AppError(403, "FORBIDDEN", message);
export const notFound = (message = "Resource not found") => new AppError(404, "NOT_FOUND", message);
export const integrationError = (provider: string) => new AppError(502, "INTEGRATION_ERROR", `Unable to fetch ${provider} data`);
