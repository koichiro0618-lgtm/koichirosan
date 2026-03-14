"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/UserSelect";
import UserSelect from "@/components/UserSelect";

interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  completed: boolean;
  createdAt: string;
}

export default function GoalsPage() {
  const { userId, userName, login } = useCurrentUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", targetDate: "" });

  const loadGoals = async () => {
    if (!userId) return;
    const res = await fetch(`/api/goals?userId=${userId}`);
    const data = await res.json();
    setGoals(data);
  };

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const handleCreate = async () => {
    if (!userId || !form.title) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...form }),
    });
    setForm({ title: "", description: "", targetDate: "" });
    setShowForm(false);
    loadGoals();
  };

  const handleToggle = async (id: number, completed: boolean) => {
    await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
    loadGoals();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/goals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadGoals();
  };

  if (!userId) return <UserSelect onSelect={login} />;

  const active = goals.filter((g) => !g.completed);
  const done = goals.filter((g) => g.completed);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">🎯 目標</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + 目標を追加
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-bold mb-4">新しい目標 ({userName})</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>目標</label>
              <input
                type="text"
                placeholder="例: Clean & Jerk 100kg達成"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>詳細 (任意)</label>
              <textarea
                rows={3}
                placeholder="目標の詳細や計画を書いてください"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm mb-1 block" style={{ color: "#9ca3af" }}>目標日 (任意)</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                style={{ width: "auto" }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-primary">追加</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* Active goals */}
      <h2 className="font-bold mb-3">進行中 ({active.length})</h2>
      {active.length === 0 ? (
        <div className="card text-center py-8 mb-6">
          <p style={{ color: "#6b7280" }}>目標を設定してモチベーションを上げよう！</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {active.map((goal) => (
            <div key={goal.id} className="card">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(goal.id, goal.completed)}
                  className="mt-0.5 w-6 h-6 rounded border-2 flex-shrink-0 transition-colors"
                  style={{ borderColor: "#ef4444" }}
                />
                <div className="flex-1">
                  <h3 className="font-bold">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>{goal.description}</p>
                  )}
                  {goal.targetDate && (
                    <p className="text-xs mt-2" style={{ color: "#6b7280" }}>
                      目標日: {new Date(goal.targetDate).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
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

      {/* Completed goals */}
      {done.length > 0 && (
        <>
          <h2 className="font-bold mb-3" style={{ color: "#22c55e" }}>達成済み ({done.length}) 🎉</h2>
          <div className="space-y-3">
            {done.map((goal) => (
              <div key={goal.id} className="card opacity-60">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(goal.id, goal.completed)}
                    className="mt-0.5 w-6 h-6 rounded flex-shrink-0 flex items-center justify-center"
                    style={{ background: "#22c55e" }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold line-through">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm mt-1" style={{ color: "#6b7280" }}>{goal.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: "#6b7280", background: "#222" }}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
