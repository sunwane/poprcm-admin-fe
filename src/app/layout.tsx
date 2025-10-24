import type { Metadata } from "next";
import "./globals.css";
import NavigationBar from "../components/layout/NavigationBar";

export const metadata: Metadata = {
  title: "POPRCM Admin",
  description: "Admin dashboard for POPRCM",
  icons: {
    icon: "/LogoNoBrand.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen">
          <NavigationBar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
