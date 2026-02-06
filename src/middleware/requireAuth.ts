import { redirect, type MiddlewareFunction } from "react-router";

const readUserRoles = (): string[] => {
  const rawRoles =
    localStorage.getItem("authRoles") ?? localStorage.getItem("authRole");

  if (!rawRoles) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawRoles);
    if (Array.isArray(parsed)) {
      return parsed.filter((role) => typeof role === "string");
    }
  } catch {
    // Fall back to treating the stored value as a single role string.
  }

  return [rawRoles];
};

export const requireAuth =
  (allowedRoles: string[] = []): MiddlewareFunction =>
  async (_, next) => {
    const isLoggedIn = Boolean(localStorage.getItem("authToken"));

    if (!isLoggedIn) {
      throw redirect("/");
    }

    if (allowedRoles.length > 0) {
      const userRoles = readUserRoles();
      const hasRequiredRole = allowedRoles.some((role) =>
        userRoles.includes(role),
      );

      if (!hasRequiredRole) {
        throw redirect("/");
      }
    }

    return next();
  };
