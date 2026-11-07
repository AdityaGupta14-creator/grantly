import { DndContext, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { TrackerCard } from '@/components/tracker/TrackerCard';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { BOARD_COLUMNS, columnForStatus, type BoardColumnId, type TrackedRow } from '@/lib/tracker';
import { cn } from '@/lib/cn';
import { type ApplicationStatus } from '@/types/tracker';

const COLUMN_LABELS: Record<BoardColumnId, string> = {
  saved: 'Saved',
  preparing: 'Preparing',
  submitted: 'Submitted',
  result: 'Result',
};

const COLUMN_PREFIX = 'column:';

const statusForDrop = (column: BoardColumnId, current: ApplicationStatus): ApplicationStatus => {
  if (column !== 'result') return column;
  return current === 'won' || current === 'rejected' ? current : 'won';
};

interface ColumnProps {
  id: BoardColumnId;
  rows: TrackedRow[];
  visible: boolean;
  onOpen: (scholarshipId: string) => void;
  onMove: (scholarshipId: string, status: ApplicationStatus) => void;
  onRemove: (scholarshipId: string) => void;
}

const BoardColumn = ({ id, rows, visible, onOpen, onMove, onRemove }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: `${COLUMN_PREFIX}${id}` });
  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`column-${id}`}
      className={cn(
        'flex min-h-64 flex-col gap-3 rounded-2xl border p-3 transition',
        visible ? 'flex' : 'hidden md:flex',
        isOver ? 'border-action bg-pale/70' : 'border-line/70 bg-raised/60',
      )}
    >
      <header className="flex items-center justify-between gap-2 px-1">
        <h3 id={`column-${id}`} className="font-heading text-base font-semibold text-fg">
          {COLUMN_LABELS[id]}
        </h3>
        <Badge tone="neutral">{rows.length}</Badge>
      </header>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
          Drop an application here
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.scholarship.id}>
              <TrackerCard row={row} onOpen={onOpen} onMove={onMove} onRemove={onRemove} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

interface KanbanBoardProps {
  rows: TrackedRow[];
  onOpen: (scholarshipId: string) => void;
  onMove: (scholarshipId: string, status: ApplicationStatus) => void;
  onRemove: (scholarshipId: string) => void;
}

export const KanbanBoard = ({ rows, onOpen, onMove, onRemove }: KanbanBoardProps) => {
  const [mobileColumn, setMobileColumn] = useState<BoardColumnId>('saved');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const rowById = new Map(rows.map((row) => [row.scholarship.id, row]));
  const nameOf = (id: string | number) => rowById.get(String(id))?.scholarship.name ?? 'application';
  const columnOf = (overId: string | number) => String(overId).replace(COLUMN_PREFIX, '') as BoardColumnId;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const row = rowById.get(String(active.id));
    if (!row) return;
    const target = columnOf(over.id);
    if (columnForStatus(row.application.status) === target) return;
    const status = statusForDrop(target, row.application.status);
    onMove(row.scholarship.id, status);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
          onDragOver: ({ over }) => (over ? `Over the ${COLUMN_LABELS[columnOf(over.id)]} column.` : 'No longer over a column.'),
          onDragEnd: ({ active, over }) =>
            over
              ? `Dropped ${nameOf(active.id)} in the ${COLUMN_LABELS[columnOf(over.id)]} column.`
              : `${nameOf(active.id)} was not moved.`,
          onDragCancel: ({ active }) => `Move cancelled for ${nameOf(active.id)}.`,
        },
      }}
    >
      <div className="md:hidden">
        <Tabs
          label="Board columns"
          items={BOARD_COLUMNS.map((column) => ({
            id: column,
            label: `${COLUMN_LABELS[column]} (${rows.filter((row) => columnForStatus(row.application.status) === column).length})`,
          }))}
          value={mobileColumn}
          onChange={setMobileColumn}
          className="mb-4"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {BOARD_COLUMNS.map((column) => (
          <BoardColumn
            key={column}
            id={column}
            rows={rows.filter((row) => columnForStatus(row.application.status) === column)}
            visible={mobileColumn === column}
            onOpen={onOpen}
            onMove={onMove}
            onRemove={onRemove}
          />
        ))}
      </div>
    </DndContext>
  );
};
