export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthenticatedUser;
}

export interface AuthSession {
  token: string;
  user: AuthenticatedUser;
  permissions: string[];
  expiresAt: number | null;
}
