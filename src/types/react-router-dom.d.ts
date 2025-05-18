declare module "react-router-dom" {
  // Import specific components from react-router-dom
  import {
    BrowserRouter,
    HashRouter,
    MemoryRouter,
    Router,
    Routes,
    Route,
    Link,
    NavLink,
    Navigate,
    Outlet,
    useNavigate,
    useParams,
    useLocation,
    useRoutes,
    // Add other components as needed
  } from "react-router-dom/dist/index";

  // Re-export all the named exports
  export {
    BrowserRouter,
    HashRouter,
    MemoryRouter,
    Router,
    Routes,
    Route,
    Link,
    NavLink,
    Navigate,
    Outlet,
    useNavigate,
    useParams,
    useLocation,
    useRoutes,
    // Add other components as needed
  };

  // Export BrowserRouter as the default export
  export default BrowserRouter;
}
