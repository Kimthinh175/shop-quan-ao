import "./assets/css/main.css";
import { Router } from "./core/Router";

const router = new Router();

export function navigateTo(url: string): void {
  window.history.pushState({}, "", url);
  router.handleRoute();
}

document.addEventListener("click", (e: MouseEvent) => {
  const target = (e.target as HTMLElement).closest("a");
  if (target && target.href && target.href.startsWith(window.location.origin)) {
    e.preventDefault();
    const path = target.getAttribute("href") || "/";
    navigateTo(path);
  }
});

window.addEventListener("popstate", () => router.handleRoute());

window.addEventListener("DOMContentLoaded", () => router.handleRoute());
