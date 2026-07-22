"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
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

const basePath = "/viral";
const getMpaHref = (path: string) => (path === "/" ? `${basePath}/` : `${basePath}${path}/`);

function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { href: "/", icon: Bell, label: "대시보드" },
    { href: "/dictionary", icon: BookOpenText, label: "사전" },
    { href: "/categories", icon: Tags, label: "카테고리" },
    { href: "/quiz-cards", icon: ListChecks, label: "퀴즈" },
    { href: "/quiz-logs", icon: BarChart3, label: "로그" },
  ];

  return (
    <aside className="fixed left-0 right-0 top-0 z-50 flex h-14 w-full flex-row items-center justify-between border-b border-white/10 bg-[#18181b] px-3.5 text-white/50 sm:bottom-0 sm:right-auto sm:h-full sm:w-16 sm:flex-col sm:justify-start sm:border-b-0 sm:border-r sm:px-0 sm:py-4">
      {/* 브랜드 로고 */}
      <div className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-white sm:size-10">
        <BrandMark className="size-6 rounded-lg sm:size-8" />
      </div>

      {/* 메뉴 아이콘 리스트 */}
      <nav className="flex flex-row items-center gap-1 sm:mt-8 sm:flex-1 sm:flex-col sm:gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <a
              href={getMpaHref(item.href)}
              key={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-1 rounded-xl px-2.5 py-1.5 transition duration-150 hover:bg-white/10 hover:text-white sm:size-10 sm:justify-center sm:px-0 sm:py-0",
                isActive ? "bg-white/10 font-bold text-white" : ""
              )}
            >
              <Icon className="size-4 shrink-0 sm:size-5" />
              <span className="text-[0.68rem] font-bold sm:hidden">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* 로그아웃 버튼 */}
      <button
        onClick={() => void logout()}
        title="로그아웃"
        className="flex size-8 items-center justify-center rounded-xl transition duration-150 hover:bg-red-500/20 hover:text-red-400 sm:size-10"
        type="button"
      >
        <LogOut className="size-4 sm:size-5" />
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
      case "/dictionary/edit":
        return "사전 항목 수정";
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
    <header className="sticky top-14 z-30 hidden h-12 items-center justify-between border-b border-black/5 bg-white/80 px-4 backdrop-blur-xl sm:flex sm:top-0 sm:h-14 sm:px-6">
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
      <div className="pt-14 sm:pl-16 sm:pt-0">
        <Header />
        <main className="p-3 sm:p-6 md:p-8">{children}</main>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <AuthProvider>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </AuthProvider>
      </body>
    </html>
  );
}
