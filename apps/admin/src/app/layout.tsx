"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BookOpenText,
  Tags,
  BarChart3,
  ListChecks,
  LogOut,
} from "lucide-react";
import { BrandMark, cn } from "@origin/ui";
import { AuthProvider, useAuth } from "@/components/auth-provider";

function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { href: "/", icon: Bell, label: "대시보드" },
    { href: "/dictionary", icon: BookOpenText, label: "사전 관리" },
    { href: "/categories", icon: Tags, label: "카테고리" },
    { href: "/quiz-cards", icon: ListChecks, label: "퀴즈 카드" },
    { href: "/quiz-logs", icon: BarChart3, label: "매치 로그" },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 flex w-16 flex-col items-center border-r border-black/5 bg-[#18181b] py-4 text-white/50">
      <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white">
        <BrandMark className="size-8 rounded-lg" />
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.href}
              title={item.label}
              className={cn(
                "flex size-10 items-center justify-center rounded-xl transition duration-150 hover:bg-white/10 hover:text-white",
                isActive ? "bg-white/10 text-white" : ""
              )}
            >
              <Icon className="size-5" />
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => void logout()}
        title="로그아웃"
        className="flex size-10 items-center justify-center rounded-xl transition duration-150 hover:bg-red-500/20 hover:text-red-400"
        type="button"
      >
        <LogOut className="size-5" />
      </button>
    </aside>
  );
}

function Header() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const getBreadcrumb = () => {
    switch (pathname) {
      case "/":
        return "대시보드";
      case "/dictionary":
        return "사전 관리";
      case "/categories":
        return "카테고리 관리";
      case "/quiz-logs":
        return "매치 로그";
      case "/quiz-cards":
        return "퀴즈 카드";
      default:
        return "관리자";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/5 bg-white/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs font-bold text-black/45">
        <span className="font-black text-black">VIRALORIGIN</span>
        <span className="text-black/20">/</span>
        <span>{getBreadcrumb()}</span>
      </div>
      <button
        onClick={() => void logout()}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-black/45 transition hover:bg-black/5 hover:text-black"
        type="button"
      >
        <LogOut className="size-3.5" />
        로그아웃
      </button>
    </header>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Sidebar />
      <div className="pl-16">
        <Header />
        <main className="p-6 sm:p-8 md:p-10">{children}</main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <title>ViralOrigin Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <AuthProvider>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </AuthProvider>
      </body>
    </html>
  );
}
