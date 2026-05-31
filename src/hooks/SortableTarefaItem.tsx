import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TarefaItemProps {
  tarefa: { id: number; conteudo: string; feita: boolean };
  children: React.ReactNode; // Passa o layout visual que você já criou para a linha da sua tarefa
}

export function SortableTarefaItem({ tarefa, children }: TarefaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarefa.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Arrastar para reordenar"
      >
        ☰
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}