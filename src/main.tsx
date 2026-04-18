import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Toaster } from "react-hot-toast";

import "./App.css";
import "./index.css";
import { App } from "./App";
import {
  Dashboard,
  Ledger,
  MechanicProfile,
  NotFound,
  RouteErrorPage,
  Unauthorized,
} from "./pages";
import { requireAuth } from "./middleware";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/ledger",
    Component: Ledger,
    middleware: [requireAuth(["user"])],
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
    middleware: [requireAuth(["admin"])],
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/mechanic/:address",
    Component: MechanicProfile,
    middleware: [requireAuth(["user", "admin"])],
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/unauthorized",
    Component: Unauthorized,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "*",
    Component: NotFound,
    errorElement: <RouteErrorPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4500,
        style: {
          background: "rgba(15, 15, 25, 0.92)",
          color: "#f1f5f9",
          border: "1px solid rgba(0, 212, 255, 0.25)",
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "0.9rem",
          backdropFilter: "blur(14px)",
          boxShadow:
            "0 10px 35px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 212, 255, 0.08)",
        },
        success: {
          iconTheme: { primary: "#00d4ff", secondary: "#0a0a0f" },
        },
        error: {
          iconTheme: { primary: "#f87171", secondary: "#0a0a0f" },
          style: {
            background: "rgba(15, 15, 25, 0.92)",
            color: "#fca5a5",
            border: "1px solid rgba(248, 113, 113, 0.3)",
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "0.9rem",
            backdropFilter: "blur(14px)",
          },
        },
      }}
    />
  </StrictMode>,
);
