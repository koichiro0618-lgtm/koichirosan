"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/UserSelect";
import UserSelect from "@/components/UserSelect";

interface PR {
  id: number;
  exercise: string;
  value: string;
  unit: string;
  date: string;
  notes?: string;
  user: { id: number; name: string };
}

const COMMON_EXERCISES = [
  "Back Squat", "Front Squat", "Overhead Squat",
  "Clean", "Power Clean", "Clean & Jerk",
  "Snatch", "Power Snatch",
  "Deadlift", "Bench Press",
  "Strict Press", "Push Press", "Push Jerk",
  "Pull-ups (max reps)", "Muscle-ups (max reps)",
  "Handstand Push-ups (max reps)",
  "Fran", "Grace", "Isabel", "Helen",
  "その他",
];

const UNITS = ["kg", "reps", "min:sec", "m", "cal"];

export default function PRBoardPage() {
  const { userId, userName, login } = useCurrentUser();
  const [allPrs, setAllPrs] = useState<PR[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [form, setForm] = useState({
    exercise: "Back Squat",
    value: "",
    unit: "kg",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    customExercise: "",
  });

  const loadPrs = async () => {
    const res = await fetch("/api/pr");
    const data = await res.json();
    setAllPrs(data);
  };

  useEffect(() => {
    loadPrs();
  }, []);

  const handleCreate = async () => {
    if (!userId || !form.value) return;
    const exercise = form.exercise === "その他" ? form.customExercise : form.exercise;
    if (!exercise) return;
    await fetch("/api/pr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        exercise,
        value: form.value,
        unit: form.unit,
        date: form.date,
        notes: form.notes,
      }),
    });
    setForm({ ...form, value: "", notes: "" });
    setShowForm(false);
    loadPrs();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/pr", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadPrs();
  };

  if (!userId) return <UserSelect onSelect={login} />;

  const displayPrs = activeTab === "all" ? allPrs : allPrs.filter((p) => p.user.id === userId);

  // Group by exercise for "all" tab
  const grouped = displayPrs.reduce<Record<string, PR[]>>((acc, pr) => {
    if (!acc[pr.exercise]) acc[pr.exercise] = [];
    acc[pr.exercise].push(pr);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">💪 PRボード</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + PRを登録
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {(["all", "mine"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded font-medium text-sm transition-all"
            style={{
              background: activeTab === tab ? "#ef4444" : "#1a1a1a",
              color: activeTab === tab ? "white" : "#9ca3af",
              border: "1px solid #2a2a2a",
            }}
          >
            {tab === "all" ? "全員のPR" : `${userName}のPR`}
          </button>
        ))}
      </div>

      {/* PR Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-bold mb-4">PRを登録 ({userName})</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>種目</label>
              <select
                value={form.exercise}
                onChange={(e) => setForm({ ...form, exercise: e.target.value })}
              >
                {COMMON_EXERCISES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            {form.exercise === "その他" && (
              <div>
                <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>種目名</label>
                <input
                  type="text"
                  placeholder="種目名を入力"
                  value={form.customExercise}
                  onChange={(e) => setForm({ ...form, customExercise: e.target.value })}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>記録</label>
                <input
                  type="text"
                  placeholder="例: 100 / 15 / 3:45"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>単位</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>日付</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
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
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-primary">登録</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* PR Display */}
      {Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-12">
          <p style={{ color: "#6b7280" }}>まだPRが登録されていません</p>
        </div>
      ) : activeTab === "all" ? (
        // All PRs grouped by exercise
        <div className="space-y-6">
          {Object.entries(grouped).map(([exercise, prs]) => (
            <div key={exercise} className="card">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span style={{ color: "#ef4444" }}>💪</span> {exercise}
              </h2>
              <div className="space-y-2">
                {prs
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((pr, i) => (
                    <div
                      key={pr.id}
                      className="flex items-center gap-3 py-2 border-b"
                      style={{ borderColor: "#222" }}
                    >
                      <span className="text-sm" style={{ color: "#6b7280" }}>{i + 1}</span>
                      <span className="font-medium flex-1">{pr.user.name}</span>
                      <span className="font-black" style={{ color: "#f87171" }}>
                        {pr.value} {pr.unit}
                      </span>
                      <span className="text-xs" style={{ color: "#6b7280" }}>
                        {new Date(pr.date).toLocaleDateString("ja-JP")}
                      </span>
                      {pr.user.id === userId && (
                        <button
                          onClick={() => handleDelete(pr.id)}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ color: "#6b7280", background: "#222" }}
                        >
                          削除
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // My PRs
        <div className="space-y-3">
          {displayPrs.map((pr) => (
            <div key={pr.id} className="card">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-bold">{pr.exercise}</div>
                  {pr.notes && <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{pr.notes}</div>}
                </div>
                <div className="text-right">
                  <div className="font-black text-xl" style={{ color: "#f87171" }}>
                    {pr.value} {pr.unit}
                  </div>
                  <div className="text-xs" style={{ color: "#6b7280" }}>
                    {new Date(pr.date).toLocaleDateString("ja-JP")}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(pr.id)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: "#6b7280", background: "#222" }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
