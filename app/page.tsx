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
    return <UserSelect onSelect={login} />;
  }

  const today = new Date().toLocaleDateString("ja-JP", {
    month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p style={{ color: "#9ca3af" }} className="text-sm">{today}</p>
          <h1 className="text-2xl font-black">
            こんにちは、<span style={{ color: "#ef4444" }}>{userName}</span> さん！💪
          </h1>
        </div>
        <button onClick={logout} className="text-sm px-3 py-1.5 rounded-lg" style={{ background: "#1a1a1a", color: "#9ca3af", border: "1px solid #2a2a2a" }}>
          ログアウト
        </button>
      </div>

      {/* 今日のWOD */}
      <div className="mb-8 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #7f1d1d, #1a1a1a)", border: "1px solid #ef4444" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold" style={{ color: "#fca5a5" }}>🏋️ 今日のWOD</span>
            {!loading && !todayWod && (
              <Link href="/wod" className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: "#ef4444", color: "white" }}>
                + 登録する
              </Link>
            )}
          </div>
          {loading ? (
            <p style={{ color: "#9ca3af" }}>読み込み中...</p>
          ) : todayWod ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  {todayWod.wodType}
                </span>
                <span className="font-black text-lg">{todayWod.title}</span>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans mb-4" style={{ color: "#d1d5db" }}>
                {todayWod.description}
              </pre>
              <Link href="/wod" className="inline-block text-sm font-bold px-4 py-2 rounded-lg" style={{ background: "#ef4444", color: "white" }}>
                結果を記録する →
              </Link>
            </div>
          ) : (
            <p style={{ color: "#9ca3af" }}>今日のWODはまだ登録されていません</p>
          )}
        </div>
      </div>

      {/* 今日の記録セクション */}
      <h2 className="font-black text-lg mb-4">📋 今日の記録</h2>
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/weight" className="block rounded-xl p-4 transition-all hover:scale-105" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", textDecoration: "none", color: "inherit" }}>
          <div className="text-3xl mb-2">⚖️</div>
          <div className="font-black">体重を記録</div>
          <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>今日の体重を入力</div>
        </Link>
        <Link href="/diary" className="block rounded-xl p-4 transition-all hover:scale-105" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", textDecoration: "none", color: "inherit" }}>
          <div className="text-3xl mb-2">📝</div>
          <div className="font-black">日記を書く</div>
          <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>今日の感想を残す</div>
        </Link>
        <Link href="/pr-board" className="block rounded-xl p-4 transition-all hover:scale-105" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", textDecoration: "none", color: "inherit" }}>
          <div className="text-3xl mb-2">💪</div>
          <div className="font-black">PRを登録</div>
          <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>自己ベストを更新</div>
        </Link>
        <Link href="/goals" className="block rounded-xl p-4 transition-all hover:scale-105" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", textDecoration: "none", color: "inherit" }}>
          <div className="text-3xl mb-2">🎯</div>
          <div className="font-black">目標を確認</div>
          <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>進捗をチェック</div>
        </Link>
      </div>

      {/* みんなの記録 */}
      <h2 className="font-black text-lg mb-4">🏆 みんなの記録</h2>
      <Link href="/leaderboard" className="block rounded-xl p-5 transition-all hover:scale-105" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", textDecoration: "none", color: "inherit" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-black text-lg">リーダーボード</div>
            <div className="text-sm mt-1" style={{ color: "#9ca3af" }}>WODのランキングを見る</div>
          </div>
          <span className="text-3xl">→</span>
        </div>
      </Link>
    </div>
  );
}
