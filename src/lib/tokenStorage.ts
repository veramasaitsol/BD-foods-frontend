// Token storage helpers, split out from authService/api so the two don't
// end up in an import cycle (api.ts needs getToken, authService.ts needs apiFetch).

export const saveToken = (token: string) => {
  localStorage.setItem('brundhavanam_token', token);
  document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
};

export const getToken = (): string | null => {
  return localStorage.getItem('brundhavanam_token');
};

export const removeToken = () => {
  localStorage.removeItem('brundhavanam_token');
  document.cookie = 'auth_token=; path=/; max-age=0';
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode JWT without verification (for client-side check only)
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const expirationTime = payload.exp * 1000;

    return Date.now() < expirationTime;
  } catch {
    return false;
  }
};
