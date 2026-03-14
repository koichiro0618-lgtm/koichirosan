"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/wod", label: "WOD", icon: "🏋️" },
  { href: "/leaderboard", label: "リーダーボード", icon: "🏆" },
  { href: "/weight", label: "体重", icon: "⚖️" },
  { href: "/goals", label: "目標", icon: "🎯" },
  { href: "/pr-board", label: "PRボード", icon: "💪" },
  { href: "/diary", label: "日記", icon: "📝" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav style={{ background: "#1a1a1a", borderBottom: "2px solid #ef4444" }}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 py-3">
          <span className="text-red-500 font-black text-xl mr-4">CrossFit 池袋</span>
          <div className="flex flex-wrap gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all"
                style={{
                  background: pathname === item.href ? "#ef4444" : "transparent",
                  color: pathname === item.href ? "white" : "#aaa",
                }}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
