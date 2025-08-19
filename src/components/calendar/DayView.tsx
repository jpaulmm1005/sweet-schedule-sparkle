import { useLayoutEffect, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Task } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import TaskItem from "./TaskItem";

interface DayViewProps {
  selectedDate: Date;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
}

const DayView = ({
  selectedDate,
  tasks,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
}: DayViewProps) => {
  // FLIP animation refs
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const prevRects = useRef(new Map<string, DOMRect>());

  const weight = (t: Task) =>
    t.priority === "high" ? 3 : t.priority === "medium" ? 2 : 1;
  const sortedTasks = [...tasks].sort((a, b) => {
    const wp = weight(b) - weight(a);
    if (wp !== 0) return wp; // higher priority first
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const totalWeight = tasks.reduce((acc, t) => acc + weight(t), 0);
  const completedWeight = tasks.reduce(
    (acc, t) => acc + (t.completed ? weight(t) : 0),
    0
  );
  const progressPct =
    totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  // FLIP animation on reorder
  const idsKey = sortedTasks.map((t) => t.id).join(",");
  useLayoutEffect(() => {
    const newRects = new Map<string, DOMRect>();
    for (const t of sortedTasks) {
      const el = itemRefs.current.get(t.id);
      if (el) newRects.set(t.id, el.getBoundingClientRect());
    }

    for (const [id, newRect] of newRects) {
      const el = itemRefs.current.get(id);
      const prevRect = prevRects.current.get(id);
      if (!el || !prevRect) continue;
      const dx = prevRect.left - newRect.left;
      const dy = prevRect.top - newRect.top;
      if (dx !== 0 || dy !== 0) {
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = "transform 0s";
        requestAnimationFrame(() => {
          el.style.transform = "";
          el.style.transition = "transform 300ms ease";
        });
      }
    }

    prevRects.current = newRects;
  }, [idsKey, sortedTasks]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Day Header */}
      <div className="bg-gradient-primary rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-pastel">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
          {format(selectedDate, "d", { locale: es })}
        </h2>
        <p className="text-white/80 font-medium text-sm sm:text-base">
          {format(selectedDate, "EEEE", { locale: es })}
        </p>
        <p className="text-white/60 text-xs sm:text-sm mt-1">
          {format(selectedDate, "MMMM yyyy", { locale: es })}
        </p>

        {/* Progress */}
        {totalWeight > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-white/80 text-xs sm:text-sm mb-2">
              <span>Progreso del día</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            Tareas de hoy
          </h3>
          {sortedTasks.length > 0 ? (
            <Button
              onClick={onAddTask}
              className="bg-primary hover:bg-primary/90 shadow-soft rounded-full h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          ) : null}
        </div>

        {/* Tasks List */}
        <div className="space-y-3 lg:space-y-4">
          {sortedTasks.length > 0 ? (
            <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 space-y-3 lg:auto-rows-fr">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(task.id, el);
                    else itemRefs.current.delete(task.id);
                  }}
                  className="will-change-transform h-full"
                >
                  <TaskItem
                    task={task}
                    onToggle={onToggleTask}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div>
                <Button
                  onClick={onAddTask}
                  className="bg-primary hover:bg-primary/90 shadow-soft rounded-full h-10 w-10 p-0"
                  aria-label="Agregar tarea"
                  title="Agregar tarea"
                >
                  <Plus className="h-5 w-5 text-white" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm mt-5">
                No tienes tareas para hoy
              </p>
              <p className="text-primary">Agregar tu primera tarea</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;
