interface DecodedAccessToken {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export function decodeAccessToken(token: string): DecodedAccessToken | null {
  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }

  try {
    const payload = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '='));
    return JSON.parse(decoded) as DecodedAccessToken;
  } catch {
    return null;
  }
}

export function isTokenExpired(expSeconds: number | undefined): boolean {
  if (!expSeconds) {
    return true;
  }
  return Date.now() >= expSeconds * 1000;
}
