import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { Task } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import TaskItem from './TaskItem';

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
  onAddTask 
}: DayViewProps) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-center shadow-pastel">
        <h2 className="text-2xl font-bold text-white mb-2">
          {format(selectedDate, 'd', { locale: es })}
        </h2>
        <p className="text-white/80 font-medium">
          {format(selectedDate, 'EEEE', { locale: es })}
        </p>
        <p className="text-white/60 text-sm mt-1">
          {format(selectedDate, 'MMMM yyyy', { locale: es })}
        </p>
        
        {/* Progress */}
        {totalCount > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-white/80 text-sm mb-2">
              <span>Progreso del día</span>
              <span>{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Tareas de hoy
          </h3>
          <Button
            onClick={onAddTask}
            className="bg-primary hover:bg-primary/90 shadow-soft rounded-full h-10 w-10 p-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-soft rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No tienes tareas para hoy
              </p>
              <Button
                onClick={onAddTask}
                variant="ghost"
                className="mt-2 text-primary hover:text-primary/80"
              >
                Agregar tu primera tarea
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;