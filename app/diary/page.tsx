"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/UserSelect";
import UserSelect from "@/components/UserSelect";

interface DiaryEntry {
  id: number;
  date: string;
  content: string;
  rating: number;
  createdAt: string;
}

const RATINGS = [
  { value: 1, label: "最悪", emoji: "😫" },
  { value: 2, label: "辛い", emoji: "😓" },
  { value: 3, label: "普通", emoji: "😐" },
  { value: 4, label: "良い", emoji: "😊" },
  { value: 5, label: "最高", emoji: "🔥" },
];

export default function DiaryPage() {
  const { userId, userName, login } = useCurrentUser();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [todayEntry, setTodayEntry] = useState<DiaryEntry | null>(null);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(3);
  const [saved, setSaved] = useState(false);

  const loadEntries = async () => {
    if (!userId) return;
    const res = await fetch(`/api/diary?userId=${userId}`);
    const data = await res.json();
    setEntries(data);
  };

  const loadEntry = async (date: string) => {
    if (!userId) return;
    const res = await fetch(`/api/diary?userId=${userId}&date=${date}`);
    const data = await res.json();
    setTodayEntry(data);
    if (data) {
      setContent(data.content);
      setRating(data.rating);
    } else {
      setContent("");
      setRating(3);
    }
    setSaved(false);
  };

  useEffect(() => {
    loadEntries();
  }, [userId]);

  useEffect(() => {
    loadEntry(selectedDate);
  }, [userId, selectedDate]);

  const handleSave = async () => {
    if (!userId || !content.trim()) return;
    await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, date: selectedDate, content, rating }),
    });
    setSaved(true);
    loadEntries();
    loadEntry(selectedDate);
  };

  if (!userId) return <UserSelect onSelect={login} />;

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">📝 トレーニング日記</h1>

      {/* Date selector */}
      <div className="card mb-6 flex items-center gap-4">
        <label className="font-medium whitespace-nowrap">日付</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ width: "auto" }}
        />
        <span className="text-sm" style={{ color: "#9ca3af" }}>
          {userName}の日記
        </span>
      </div>

      {/* Editor */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">
          {new Date(selectedDate).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </h2>

        {/* Rating */}
        <div className="mb-4">
          <label className="text-sm mb-2 block" style={{ color: "#9ca3af" }}>今日のトレーニングはどうでしたか？</label>
          <div className="flex gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRating(r.value)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded transition-all"
                style={{
                  background: rating === r.value ? "#ef4444" : "#222",
                  color: rating === r.value ? "white" : "#9ca3af",
                  border: `1px solid ${rating === r.value ? "#ef4444" : "#333"}`,
                }}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="text-xs">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="text-sm mb-2 block" style={{ color: "#9ca3af" }}>感想・メモ</label>
          <textarea
            rows={6}
            placeholder={"今日のトレーニングの感想、気づいたこと、次回への反省などを書いてください...\n\n例:\n・スクワットで股関節の動きが改善した\n・Fran 4:32 (PR!)\n・バーベルを落とさずに最後まで集中できた"}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary">
            {todayEntry ? "更新" : "保存"}
          </button>
          {saved && (
            <span className="text-sm" style={{ color: "#22c55e" }}>✓ 保存しました</span>
          )}
        </div>
      </div>

      {/* Past entries */}
      <h2 className="text-xl font-bold mb-4">過去の日記</h2>
      {entries.length === 0 ? (
        <div className="card text-center py-8">
          <p style={{ color: "#6b7280" }}>まだ日記がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const ratingInfo = RATINGS.find((r) => r.value === entry.rating);
            return (
              <div
                key={entry.id}
                className="card cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => setSelectedDate(new Date(entry.date).toISOString().split("T")[0])}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {new Date(entry.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </span>
                  <span className="text-lg" title={ratingInfo?.label}>{ratingInfo?.emoji}</span>
                </div>
                <p className="text-sm line-clamp-3 whitespace-pre-wrap" style={{ color: "#d1d5db" }}>
                  {entry.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
