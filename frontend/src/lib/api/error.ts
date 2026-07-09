import type { AxiosError } from 'axios';

interface BackendErrorBody {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string | string[];
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly details: string[];

  constructor(message: string, statusCode: number, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function toApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<BackendErrorBody>;

  if (!axiosError?.isAxiosError) {
    return new ApiError('An unexpected error occurred. Please try again.', 0);
  }

  if (!axiosError.response) {
    return new ApiError('Unable to reach the server. Check your connection and try again.', 0);
  }

  const { status, data } = axiosError.response;
  const rawError = data?.error;

  if (Array.isArray(rawError)) {
    return new ApiError(rawError[0] ?? 'Request failed.', status, rawError);
  }

  return new ApiError(rawError || 'Request failed.', status, rawError ? [rawError] : []);
}
