"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/UserSelect";
import UserSelect from "@/components/UserSelect";

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

const WOD_TYPES = ["AMRAP", "For Time", "EMOM", "Every 3 min", "Chipper", "Ladder", "その他"];

export default function WODPage() {
  const { userId, userName, login } = useCurrentUser();
  const [wods, setWods] = useState<WOD[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [todayWod, setTodayWod] = useState<WOD | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [scoreInput, setScoreInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    wodType: "AMRAP",
  });

  const loadWod = async (date: string) => {
    const res = await fetch(`/api/wod?date=${date}`);
    const data = await res.json();
    setTodayWod(data);
  };

  const loadWods = async () => {
    const res = await fetch("/api/wod");
    const data = await res.json();
    setWods(data);
  };

  useEffect(() => {
    loadWod(selectedDate);
    loadWods();
  }, [selectedDate]);

  const handleCreateWod = async () => {
    if (!form.title || !form.description) return;
    await fetch("/api/wod", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date: selectedDate }),
    });
    setShowCreateForm(false);
    setForm({ title: "", description: "", wodType: "AMRAP" });
    loadWod(selectedDate);
    loadWods();
  };

  const handleSubmitResult = async () => {
    if (!userId || !todayWod || !scoreInput) return;
    await fetch("/api/wod-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wodId: todayWod.id,
        userId,
        score: scoreInput,
        notes: notesInput,
      }),
    });
    setScoreInput("");
    setNotesInput("");
    loadWod(selectedDate);
  };

  if (!userId) {
    return <UserSelect onSelect={login} />;
  }

  const myResult = todayWod?.results.find((r) => r.user.id === userId);

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">🏋️ WOD</h1>

      {/* Date selector */}
      <div className="card mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="font-medium">日付</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: "auto" }}
          />
        </div>
        {!todayWod && (
          <button onClick={() => setShowCreateForm(true)} className="btn-primary text-sm">
            WODを登録
          </button>
        )}
      </div>

      {/* Create WOD Form */}
      {showCreateForm && (
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-4">WODを登録 ({selectedDate})</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400 block mb-1">タイプ</label>
              <select
                value={form.wodType}
                onChange={(e) => setForm({ ...form, wodType: e.target.value })}
              >
                {WOD_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">タイトル</label>
              <input
                type="text"
                placeholder="例: 21-15-9 Thrusters & Pull-ups"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">内容</label>
              <textarea
                rows={5}
                placeholder={"例:\n21-15-9 reps for time\n- Thruster 43kg/29kg\n- Pull-ups"}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateWod} className="btn-primary">登録</button>
              <button onClick={() => setShowCreateForm(false)} className="btn-secondary">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* Today's WOD */}
      {todayWod ? (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {todayWod.wodType}
            </span>
            <h2 className="text-xl font-bold">{todayWod.title}</h2>
          </div>
          <pre className="text-sm whitespace-pre-wrap font-sans mb-4" style={{ color: "#d1d5db" }}>
            {todayWod.description}
          </pre>

          {/* Submit result */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-medium mb-3">
              {myResult ? "結果を更新" : "結果を記録"} ({userName})
            </h3>
            {myResult && (
              <p className="text-sm mb-2" style={{ color: "#9ca3af" }}>
                現在の記録: <span className="text-white font-bold">{myResult.score}</span>
                {myResult.notes && ` / ${myResult.notes}`}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="スコア (例: 12:34 / 5 rounds + 10 reps)"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
              />
              <input
                type="text"
                placeholder="メモ (任意)"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />
              <button onClick={handleSubmitResult} className="btn-primary whitespace-nowrap">
                記録
              </button>
            </div>
          </div>

          {/* Results */}
          {todayWod.results.length > 0 && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="font-medium mb-3">みんなの記録</h3>
              <div className="space-y-2">
                {todayWod.results.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-800">
                    <span className="text-gray-500 text-sm w-6">{i + 1}</span>
                    <span className="font-medium flex-1">{r.user.name}</span>
                    <span className="font-bold text-red-400">{r.score}</span>
                    {r.notes && <span className="text-xs text-gray-500">{r.notes}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        !showCreateForm && (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg mb-4">この日のWODはありません</p>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary">
              WODを登録する
            </button>
          </div>
        )
      )}

      {/* Past WODs */}
      <h2 className="text-xl font-bold mb-4 mt-8">過去のWOD</h2>
      <div className="space-y-3">
        {wods
          .filter((w) => w.id !== todayWod?.id)
          .slice(0, 10)
          .map((wod) => (
            <div
              key={wod.id}
              className="card cursor-pointer hover:border-red-500 transition-colors"
              onClick={() => setSelectedDate(new Date(wod.date).toISOString().split("T")[0])}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">{wod.wodType}</span>
                  <span className="font-medium">{wod.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(wod.date).toLocaleDateString("ja-JP")}
                  </span>
                  <span className="text-xs text-gray-500">{wod.results.length}人記録済み</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
