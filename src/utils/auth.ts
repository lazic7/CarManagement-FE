const AUTH_KEYS = ["authToken", "authRole", "authRoles"] as const;

export const clearAuthSession = (): void => {
  for (const key of AUTH_KEYS) {
    localStorage.removeItem(key);
  }
};
