/**
 * Hash-based SPA Router
 * Routes: #/login, #/dashboard, #/muhurta, #/scanner, #/kp, #/kp-query,
 *         #/kundali, #/kundali-form, #/wallet, #/referral, #/birth-chart
 *
 * Query-string support: #/birth-chart?id=5 → route "/birth-chart", params "id=5"
 * The handler receives no args; screens parse window.location.hash themselves.
 */

import { renderLogin } from "./screens/login";
import { renderDashboard } from "./screens/dashboard";
import { renderMuhurta } from "./screens/muhurta";
import { renderKundaliList } from "./screens/kundali-list";
import { renderKundaliForm } from "./screens/kundali-form";
import { renderKpQuery } from "./screens/kp-query";
import { renderAdminPanel } from "./screens/admin-panel";
import { renderScanner } from "./screens/scanner";
import { renderWallet } from "./screens/wallet";
import { renderReferral } from "./screens/referral";
import { renderBirthChart } from "./screens/birth-chart";

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
    this.routes.set("/kp-query", renderKpQuery);
    this.routes.set("/scanner", renderScanner);
    this.routes.set("/wallet", renderWallet);
    this.routes.set("/referral", renderReferral);
    this.routes.set("/admin", renderAdminPanel);
    this.routes.set("/birth-chart", renderBirthChart);
  }

  currentRoute(): string {
    return window.location.hash.slice(1) || "/login";
  }

  /** Strip query string from hash path before looking up the handler.
   *  e.g. "/birth-chart?id=5" → "/birth-chart"
   */
  private basePath(fullPath: string): string {
    return fullPath.split("?")[0] ?? fullPath;
  }

  async route(): Promise<void> {
    const path = this.currentRoute();
    const handler = this.routes.get(this.basePath(path));

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
