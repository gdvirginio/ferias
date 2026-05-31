"use client";

export default function Mascote({ nivel }: { nivel: number }) {
  return (
    <div className="p-6 bg-slate-800 rounded-2xl text-center">
      <div className="text-6xl">{nivel > 50 ? '🤩' : '😴'}</div>
      <p>Energia: {nivel}%</p>
    </div>
  );
}
