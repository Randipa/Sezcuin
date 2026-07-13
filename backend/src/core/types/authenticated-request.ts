import { Request } from 'express';

export interface AuthenticatedUserPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUserPayload;
}
