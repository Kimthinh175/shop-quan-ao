"use client";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AppPreloader from "../../components/common/AppPreloader";
import { ThemeProvider } from "../../components/common/ThemeProvider";
import { AuthProvider } from "../../context/AuthContext";
import AdminGuard from "../../components/admin/AdminGuard";
import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>Dashboard | Closet Admin</title>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 flex h-screen overflow-hidden transition-colors duration-300"
      >
        <AuthProvider>
          <ThemeProvider>
            <AppPreloader />
            <AdminGuard>
              <div className="flex h-screen w-full overflow-hidden">
                <AdminSidebar />

                <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0B0B0B]">
                  <AdminHeader />

                  <div className="flex-1 flex overflow-hidden">{children}</div>
                </main>
              </div>
            </AdminGuard>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
