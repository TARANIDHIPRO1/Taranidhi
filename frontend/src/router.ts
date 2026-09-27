/**
 * Hash-based SPA Router
 * Routes: #/login, #/dashboard, #/muhurta, #/scanner, #/kp, #/kp-query,
 *         #/kundali, #/kundali-form, #/wallet, #/referral
 */

import { renderLogin } from "./screens/login";
import { renderDashboard } from "./screens/dashboard";
import { renderMuhurta } from "./screens/muhurta";
import { renderKundaliList } from "./screens/kundali-list";
import { renderKundaliForm } from "./screens/kundali-form";
// TODO: import { renderScanner }, renderKp, renderKpQuery, renderWallet, renderReferral

type RouteHandler = () => Promise<void> | void;

export class Router {
  private routes = new Map<string, RouteHandler>();

  constructor() {
    // Register routes
    this.routes.set("/login", renderLogin);
    this.routes.set("/dashboard", renderDashboard);
    this.routes.set("/muhurta", renderMuhurta);
    this.routes.set("/kundali", renderKundaliList);
    this.routes.set("/kundali-form", renderKundaliForm);
    // TODO: Add /scanner, /kp, /kp-query, /wallet, /referral
  }

  currentRoute(): string {
    return window.location.hash.slice(1) || "/login";
  }

  async route(): Promise<void> {
    const path = this.currentRoute();
    const handler = this.routes.get(path);

    if (handler) {
      try {
        await handler();
      } catch (error) {
        console.error(`Route handler error for ${path}:`, error);
      }
    } else {
      // Fallback to login
      const fallback = this.routes.get("/login");
      if (fallback) await fallback();
    }
  }
}

export function navigate(path: string): void {
  window.location.hash = path;
}
