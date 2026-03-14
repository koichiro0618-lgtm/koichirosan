"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/UserSelect";
import UserSelect from "@/components/UserSelect";

interface WeightLog {
  id: number;
  weight: number;
  date: string;
  notes?: string;
}

export default function WeightPage() {
  const { userId, userName, login } = useCurrentUser();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [form, setForm] = useState({
    weight: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const loadLogs = async () => {
    if (!userId) return;
    const res = await fetch(`/api/weight?userId=${userId}`);
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => {
    loadLogs();
  }, [userId]);

  const handleSubmit = async () => {
    if (!userId || !form.weight) return;
    await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        weight: parseFloat(form.weight),
        date: form.date,
        notes: form.notes,
      }),
    });
    setForm({ ...form, weight: "", notes: "" });
    loadLogs();
  };

  if (!userId) return <UserSelect onSelect={login} />;

  const latest = logs[0];
  const oldest = logs[logs.length - 1];
  const diff = latest && oldest && latest.id !== oldest.id
    ? (latest.weight - oldest.weight).toFixed(1)
    : null;

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">⚖️ 体重記録</h1>

      {/* Stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-black" style={{ color: "#ef4444" }}>{latest.weight}kg</div>
            <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>最新</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-black">
              {Math.min(...logs.map((l) => l.weight))}kg
            </div>
            <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>最低</div>
          </div>
          <div className="card text-center">
            <div
              className="text-2xl font-black"
              style={{ color: diff !== null ? (parseFloat(diff) < 0 ? "#22c55e" : parseFloat(diff) > 0 ? "#ef4444" : "#f0f0f0") : "#f0f0f0" }}
            >
              {diff !== null ? `${parseFloat(diff) > 0 ? "+" : ""}${diff}kg` : "-"}
            </div>
            <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>変化</div>
          </div>
        </div>
      )}

      {/* Simple chart */}
      {logs.length > 1 && (
        <div className="card mb-6">
          <h2 className="font-bold mb-4">推移グラフ</h2>
          <div className="relative h-32">
            {(() => {
              const reversed = [...logs].reverse();
              const weights = reversed.map((l) => l.weight);
              const min = Math.min(...weights) - 1;
              const max = Math.max(...weights) + 1;
              const range = max - min;
              return (
                <svg viewBox={`0 0 ${reversed.length * 30} 120`} className="w-full h-full">
                  <polyline
                    points={reversed
                      .map((l, i) => `${i * 30 + 15},${120 - ((l.weight - min) / range) * 100}`)
                      .join(" ")}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  {reversed.map((l, i) => (
                    <circle
                      key={l.id}
                      cx={i * 30 + 15}
                      cy={120 - ((l.weight - min) / range) * 100}
                      r="4"
                      fill="#ef4444"
                    />
                  ))}
                </svg>
              );
            })()}
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">体重を記録 ({userName})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>日付</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="例: 72.5"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>メモ</label>
            <input
              type="text"
              placeholder="任意"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <button onClick={handleSubmit} className="btn-primary mt-4">
          記録する
        </button>
      </div>

      {/* Log list */}
      <div className="card">
        <h2 className="font-bold mb-4">記録一覧</h2>
        {logs.length === 0 ? (
          <p style={{ color: "#6b7280" }}>まだ記録がありません</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 py-2 border-b" style={{ borderColor: "#2a2a2a" }}>
                <span className="text-sm" style={{ color: "#9ca3af" }}>
                  {new Date(log.date).toLocaleDateString("ja-JP")}
                </span>
                <span className="font-bold flex-1">{log.weight}kg</span>
                {log.notes && <span className="text-sm" style={{ color: "#6b7280" }}>{log.notes}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
