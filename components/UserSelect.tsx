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

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  const handleSelect = (user: { id: number; name: string }) => {
    onSelect(user);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const user = await res.json();
    setUsers((prev) => [...prev, user]);
    onSelect(user);
    setLoading(false);
  };

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-red-500">メンバーを選択</h2>
      <div className="space-y-2 mb-6">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleSelect(user)}
            className="w-full text-left px-4 py-3 rounded font-medium transition-all hover:bg-red-500 hover:text-white"
            style={{ background: "#222", color: "#f0f0f0" }}
          >
            {user.name}
          </button>
        ))}
        {users.length === 0 && (
          <p className="text-gray-500 text-sm">メンバーがいません。下から追加してください。</p>
        )}
      </div>
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-400 mb-2">新しいメンバーを追加</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="名前を入力"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-primary whitespace-nowrap"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
