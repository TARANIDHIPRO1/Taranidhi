// Minimal hash-based SPA router.
// Routes: #/login, #/dashboard, #/muhurta, #/scanner, #/kp, #/kp-query,
//         #/kundali, #/wallet, #/referral

type RouteHandler = () => void;
const routes = new Map<string, RouteHandler>();

export function route(path: string, handler: RouteHandler) {
  routes.set(path, handler);
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function currentRoute(): string {
  return window.location.hash.slice(1) || "/login";
}

export function startRouter() {
  const dispatch = () => {
    const path = currentRoute();
    const handler = routes.get(path);
    if (handler) handler();
    else {
      // Fallback: try to match parameterized routes or go to login
      const fallback = routes.get("/login");
      if (fallback) fallback();
    }
  };
  window.addEventListener("hashchange", dispatch);
  dispatch();
}
