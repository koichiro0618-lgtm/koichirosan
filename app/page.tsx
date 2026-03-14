"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/components/UserSelect";
import UserSelect from "@/components/UserSelect";

interface WOD {
  id: number;
  date: string;
  title: string;
  description: string;
  wodType: string;
}

export default function Home() {
  const { userId, userName, login, logout } = useCurrentUser();
  const [todayWod, setTodayWod] = useState<WOD | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/wod?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        setTodayWod(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!userId) {
    return (
      <div className="py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black" style={{ color: "#ef4444" }}>CrossFit 池袋</h1>
          <p style={{ color: "#9ca3af" }} className="mt-2">メンバーポータルサイト</p>
        </div>
        <UserSelect onSelect={login} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black" style={{ color: "#ef4444" }}>CrossFit 池袋</h1>
          <p style={{ color: "#9ca3af" }} className="mt-1">こんにちは、{userName}さん！</p>
        </div>
        <button onClick={logout} className="btn-secondary text-sm">
          ログアウト
        </button>
      </div>

      {/* Today's WOD */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">今日のWOD</h2>
          <span className="text-sm" style={{ color: "#9ca3af" }}>
            {new Date().toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </span>
        </div>
        {loading ? (
          <p style={{ color: "#6b7280" }}>読み込み中...</p>
        ) : todayWod ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-white text-xs font-bold px-2 py-1 rounded"
                style={{ background: "#ef4444" }}
              >
                {todayWod.wodType}
              </span>
              <h3 className="font-bold text-lg">{todayWod.title}</h3>
            </div>
            <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: "#d1d5db" }}>
              {todayWod.description}
            </pre>
            <Link
              href="/wod"
              className="inline-block mt-3 text-sm hover:underline"
              style={{ color: "#f87171" }}
            >
              結果を記録する →
            </Link>
          </div>
        ) : (
          <div>
            <p className="mb-3" style={{ color: "#6b7280" }}>今日のWODはまだ登録されていません</p>
            <Link href="/wod" className="btn-primary inline-block text-sm">
              WODを登録する
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { href: "/wod", icon: "🏋️", label: "WOD", desc: "今日のメニュー" },
          { href: "/leaderboard", icon: "🏆", label: "リーダーボード", desc: "メンバーランキング" },
          { href: "/weight", icon: "⚖️", label: "体重", desc: "体重を記録" },
          { href: "/goals", icon: "🎯", label: "目標", desc: "目標を設定" },
          { href: "/pr-board", icon: "💪", label: "PRボード", desc: "自己ベストを登録" },
          { href: "/diary", icon: "📝", label: "日記", desc: "今日の感想" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card block transition-colors hover:border-red-500"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="font-bold">{item.label}</div>
            <div className="text-sm" style={{ color: "#9ca3af" }}>{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
