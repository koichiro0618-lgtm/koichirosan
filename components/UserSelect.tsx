"use client";

import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("crossfit_user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserId(user.id);
      setUserName(user.name);
    }
  }, []);

  const login = (user: { id: number; name: string }) => {
    localStorage.setItem("crossfit_user", JSON.stringify(user));
    setUserId(user.id);
    setUserName(user.name);
  };

  const logout = () => {
    localStorage.removeItem("crossfit_user");
    setUserId(null);
    setUserName("");
  };

  return { userId, userName, login, logout };
}

interface UserSelectProps {
  onSelect: (user: { id: number; name: string }) => void;
}

export default function UserSelect({ onSelect }: UserSelectProps) {
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"top" | "existing" | "new">("top");

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then((data) => {
      setUsers(data);
    });
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const user = await res.json();
    onSelect(user);
    setLoading(false);
  };

  // トップ画面
  if (mode === "top") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-4xl font-black mb-2" style={{ color: "#ef4444" }}>CrossFit 池袋</h1>
          <p style={{ color: "#9ca3af" }}>トレーニングを記録して、仲間と競おう！</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => setMode("new")}
            className="btn-primary text-lg py-4 rounded-xl font-black"
          >
            🆕 はじめて使う
          </button>
          {users.length > 0 && (
            <button
              onClick={() => setMode("existing")}
              className="btn-secondary text-lg py-4 rounded-xl font-bold"
            >
              👤 ログインする
            </button>
          )}
        </div>
      </div>
    );
  }

  // 既存メンバーのログイン
  if (mode === "existing") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <button
            onClick={() => setMode("top")}
            className="text-sm mb-6 flex items-center gap-1"
            style={{ color: "#9ca3af" }}
          >
            ← 戻る
          </button>
          <h2 className="text-2xl font-black mb-2">👤 ログイン</h2>
          <p className="text-sm mb-6" style={{ color: "#9ca3af" }}>名前を選んでください</p>
          <div className="space-y-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelect(user)}
                className="w-full text-left px-5 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                style={{
                  background: "#1a1a1a",
                  border: "2px solid #2a2a2a",
                  color: "#f0f0f0",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
                }}
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 新規メンバー登録
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setMode("top")}
          className="text-sm mb-6 flex items-center gap-1"
          style={{ color: "#9ca3af" }}
        >
          ← 戻る
        </button>
        <h2 className="text-2xl font-black mb-2">🆕 メンバー登録</h2>
        <p className="text-sm mb-6" style={{ color: "#9ca3af" }}>あなたの名前を入力してください</p>
        <input
          type="text"
          placeholder="例：田中 太郎"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="text-lg py-4 mb-4"
          autoFocus
        />
        <button
          onClick={handleCreate}
          disabled={loading || !newName.trim()}
          className="btn-primary w-full text-lg py-4 rounded-xl font-black"
          style={{ opacity: !newName.trim() ? 0.5 : 1 }}
        >
          {loading ? "登録中..." : "登録してはじめる →"}
        </button>
      </div>
    </div>
  );
}
