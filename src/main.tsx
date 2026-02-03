import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import "./App.css";
import "./index.css";
import { App } from "./App";
import {
  Dashboard,
  Ledger,
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
    middleware: [requireAuth],
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
    middleware: [requireAuth],
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
  </StrictMode>,
);
