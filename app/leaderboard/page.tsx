"use client";

import { useEffect, useState } from "react";

interface WodResult {
  id: number;
  score: string;
  notes?: string;
  user: { id: number; name: string };
}

interface WOD {
  id: number;
  date: string;
  title: string;
  description: string;
  wodType: string;
  results: WodResult[];
}

export default function LeaderboardPage() {
  const [wods, setWods] = useState<WOD[]>([]);
  const [selectedWod, setSelectedWod] = useState<WOD | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wod")
      .then((r) => r.json())
      .then((data: WOD[]) => {
        const withResults = data.filter((w) => w.results.length > 0);
        setWods(withResults);
        if (withResults.length > 0) setSelectedWod(withResults[0]);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">🏆 リーダーボード</h1>

      {loading ? (
        <p style={{ color: "#6b7280" }}>読み込み中...</p>
      ) : wods.length === 0 ? (
        <div className="card text-center py-12">
          <p style={{ color: "#6b7280" }}>まだWODの記録がありません</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* WOD selector */}
          <div className="sm:w-64">
            <h2 className="font-bold mb-3 text-sm" style={{ color: "#9ca3af" }}>WODを選択</h2>
            <div className="space-y-2">
              {wods.map((wod) => (
                <button
                  key={wod.id}
                  onClick={() => setSelectedWod(wod)}
                  className="w-full text-left px-3 py-2 rounded transition-all text-sm"
                  style={{
                    background: selectedWod?.id === wod.id ? "#ef4444" : "#1a1a1a",
                    color: selectedWod?.id === wod.id ? "white" : "#d1d5db",
                    border: "1px solid #2a2a2a",
                  }}
                >
                  <div className="font-medium">{wod.title}</div>
                  <div className="text-xs opacity-70">
                    {new Date(wod.date).toLocaleDateString("ja-JP")} · {wod.results.length}人
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="flex-1">
            {selectedWod && (
              <div className="card">
                <div className="mb-4">
                  <span
                    className="text-white text-xs font-bold px-2 py-1 rounded"
                    style={{ background: "#ef4444" }}
                  >
                    {selectedWod.wodType}
                  </span>
                  <h2 className="text-xl font-bold mt-2">{selectedWod.title}</h2>
                  <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
                    {new Date(selectedWod.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  {selectedWod.results.map((result, i) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-4 py-3 px-4 rounded"
                      style={{
                        background: i === 0 ? "rgba(234, 179, 8, 0.1)" : i === 1 ? "rgba(156, 163, 175, 0.1)" : i === 2 ? "rgba(180, 83, 9, 0.1)" : "#111",
                        border: `1px solid ${i === 0 ? "rgba(234, 179, 8, 0.3)" : i === 1 ? "rgba(156, 163, 175, 0.3)" : i === 2 ? "rgba(180, 83, 9, 0.3)" : "#222"}`,
                      }}
                    >
                      <span className="text-2xl w-8 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </span>
                      <span className="font-bold flex-1">{result.user.name}</span>
                      <span className="font-black text-lg" style={{ color: "#f87171" }}>
                        {result.score}
                      </span>
                      {result.notes && (
                        <span className="text-xs" style={{ color: "#6b7280" }}>{result.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
