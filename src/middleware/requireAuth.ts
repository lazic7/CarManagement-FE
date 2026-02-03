import { redirect, type MiddlewareFunction } from "react-router";

export const requireAuth: MiddlewareFunction = async (_, next) => {
  const isLoggedIn = Boolean(localStorage.getItem("authToken"));

  if (!isLoggedIn) {
    throw redirect(`/unauthorized`);
  }

  return next();
};
