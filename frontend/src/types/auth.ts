export interface User {
  id: 'string';
  email: 'string';
  firstName: 'string';
  lastName: 'string';

  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
