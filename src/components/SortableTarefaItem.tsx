"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTaskCardProps {
  t: { id: number; conteudo: string; feita: boolean };
  alternarTarefa: (id: number, status: boolean) => void;
  editarTarefa: (id: number, conteudo: string) => void;
  deletarTarefa: (id: number) => void;
}

export function SortableTaskCard({
  t,
  alternarTarefa,
  editarTarefa,
  deletarTarefa,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: t.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : t.feita ? 0.6 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="task-card flex items-center">
      {/* Alça de arrastar com trava de toque para não rolar a página */}
      <div
        {...attributes}
        {...listeners}
        style={{ touchAction: "none" }}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 select-none mr-2"
        title="Arrastar para reordenar"
      >
        ☰
      </div>

      <input
        type="checkbox"
        className="checkbox-custom"
        checked={t.feita}
        onChange={() => alternarTarefa(t.id, t.feita)}
      />

      <input
        className="input-main"
        value={t.conteudo}
        onChange={(e) => editarTarefa(t.id, e.target.value)}
        style={{
          textDecoration: t.feita ? "line-through" : "none",
          fontWeight: 500,
        }}
      />

      <button className="btn-delete" onClick={() => deletarTarefa(t.id)}>
        🗑️
      </button>
    </li>
  );
}
