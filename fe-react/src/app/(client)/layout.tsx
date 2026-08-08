import Link from "next/link";
import Script from "next/script";
import Header from "../../components/client/Header";
import Footer from "../../components/client/Footer";
import AppPreloader from "../../components/common/AppPreloader";
import { ThemeProvider } from "../../components/common/ThemeProvider";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import "../globals.css";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>CLOSET | Quiet Luxury Fashion Store</title>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Anti-FOUC script to set theme before paint */}
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('closet_theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-300 selection:bg-indigo-100 dark:selection:bg-amber-900/40 overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              {/* Instant Skeleton Overlay for Slow Network */}
              <AppPreloader />

              <Header />

              {children}

              <Footer />
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
