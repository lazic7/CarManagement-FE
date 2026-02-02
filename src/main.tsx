import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import "./App.css";
import "./index.css";
import { App } from "./App";
import { Dashboard, Ledger } from "./features";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/ledger",
    Component: Ledger,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
