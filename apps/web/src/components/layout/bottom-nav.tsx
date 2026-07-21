"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, BookOpenText, Gamepad2, PlusCircle } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/feed",
      label: "피드",
      icon: Flame,
      isActive: pathname === "/feed",
    },
    {
      href: "/",
      label: "사전",
      icon: BookOpenText,
      isActive: pathname === "/" || pathname.startsWith("/memes/"),
    },
    {
      href: "/quiz",
      label: "퀴즈",
      icon: Gamepad2,
      isActive: pathname === "/quiz",
    },
    {
      href: "/submit",
      label: "제보",
      icon: PlusCircle,
      isActive: pathname === "/submit",
    },
  ];

  return (
    <nav
      aria-label="하단 내비게이션"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white/90 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg sm:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1 transition-all ${
                active
                  ? "text-[#fe2c55] font-black"
                  : "text-black/45 hover:text-black/80 font-bold"
              }`}
            >
              <Icon
                className={`size-5 transition-transform ${
                  active ? "scale-110 stroke-[2.5]" : "stroke-2"
                }`}
              />
              <span className="text-[0.65rem] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
