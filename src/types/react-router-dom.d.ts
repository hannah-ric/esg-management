declare module 'react-router-dom' {
  // Re-export specific named exports from 'react-router-dom/dist/index'
  // Based on common React Router v6 exports

  // Router Components & Setup
  export {
    BrowserRouter,
    HashRouter,
    MemoryRouter,
    Router, // Less common, but part of the API
    Routes,
    Route,
    // For newer data routers:
    RouterProvider,
    createBrowserRouter,
    createHashRouter,
    createMemoryRouter,
    createRoutesFromChildren,
    createRoutesFromElements,
    // For SSR, though less common in basic SPA type defs:
    // StaticRouter, // Older
    // createStaticRouter, // Newer
    // StaticRouterProvider // Newer
  } from 'react-router-dom/dist/index';

  // Navigation & Links & Outlet
  export { Link, NavLink, Navigate, Outlet } from 'react-router-dom/dist/index';

  // Hooks
  export {
    useHref,
    useInRouterContext,
    useLinkClickHandler,
    useLocation,
    useMatch,
    useNavigate,
    useNavigationType,
    useOutlet,
    useOutletContext,
    useParams,
    useResolvedPath,
    useRoutes,
    useSearchParams,
    // Data API Hooks
    useLoaderData,
    useActionData,
    useFetcher,
    useNavigation, // For pending states and more
    useSubmit,
    useRouteError,
    useRevalidator,
    // Newer/Experimental/Less common hooks if needed by the project
    // useMatches,
    // useBlocker,
    // usePrompt (unstable_usePrompt),
    // useFormAction,
    // useAsyncError,
    // useAsyncValue,
    // useBeforeUnload,
    // useRouteLoaderData,
    // useViewTransitionState
  } from 'react-router-dom/dist/index';

  // Utilities
  export {
    createPath,
    createSearchParams,
    generatePath,
    matchPath,
    // matchRoutes, // Often for data routers
    parsePath,
    resolvePath,
    ScrollRestoration,
    // Data API Utilities
    defer,
    json,
    redirect,
    // isRouteErrorResponse,
    // redirectDocument, // Less common for SPA augmentation
    // Location (type), NavigationType (enum) might also be relevant
    // If these are directly exported and needed:
    // Location,
    // NavigationType
  } from 'react-router-dom/dist/index';

  // It's important to verify if 'react-router-dom/dist/index' has a default export
  // that is meaningful. Typically, react-router-dom is used with named exports.
  // If there is a default export and it's needed:
  // export { default } from 'react-router-dom/dist/index';
  // However, since the request is to remove star exports and be explicit,
  // and a default export from the main 'react-router-dom' module isn't standard,
  // we'll omit it unless specifically known to be required from 'dist/index'.
}
