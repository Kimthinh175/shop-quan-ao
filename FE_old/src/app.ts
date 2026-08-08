import "./assets/css/main.css";
import { Router } from "./core/Router";
import { AuthModal } from "./components/AuthModal";

const router = new Router();

(window as any).showAuthModal = () => {
  AuthModal.getInstance().show();
};

export function navigateTo(url: string): void {
  window.history.pushState({}, "", url);
  router.handleRoute();
}

document.addEventListener("click", (e: MouseEvent) => {
  const target = (e.target as HTMLElement).closest("a");
  if (target && target.href && target.href.startsWith(window.location.origin)) {
    e.preventDefault();
    
    // Auth Guard check before navigating
    let path = target.getAttribute("href") || "/";
    const route = router.matchRoute(path);
    if (route && route.requiresAuth && !localStorage.getItem("token")) {
      if ((window as any).showAuthModal) {
        (window as any).showAuthModal();
      } else {
        alert("Vui lòng đăng nhập để truy cập trang này.");
      }
      return;
    }

    navigateTo(path);
  }
});

window.addEventListener("popstate", () => router.handleRoute());

window.addEventListener("DOMContentLoaded", () => router.handleRoute());
