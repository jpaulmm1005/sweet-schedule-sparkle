import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Edit3 } from 'lucide-react';
import { Task } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  showDate?: boolean;
}

const TaskItem = ({ task, onToggle, onUpdate, onDelete, showDate = false }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editTime, setEditTime] = useState(task.time || '');

  const handleLongPress = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDescription,
      time: editTime,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditTime(task.time || '');
    setIsEditing(false);
  };

  return (
    <>
      <div
        className={`group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 cursor-pointer
          ${task.completed 
            ? 'opacity-60 bg-muted/30' 
            : 'hover:bg-white/80 hover:shadow-soft'
          }`}
        onClick={() => onToggle(task.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
      >
        {/* Task Content */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div 
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-smooth mt-0.5
              ${task.completed 
                ? 'bg-primary border-primary' 
                : 'border-primary/40 hover:border-primary'
              }`}
          >
            {task.completed && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm transition-smooth
              ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}
            `}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-xs mt-1 transition-smooth
                ${task.completed ? 'line-through text-muted-foreground/60' : 'text-muted-foreground'}
              `}>
                {task.description}
              </p>
            )}

            {/* Time and Date */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {task.time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{task.time}</span>
                </div>
              )}
              {showDate && (
                <span>{format(new Date(task.date), 'dd MMM')}</span>
              )}
            </div>
          </div>

          {/* Edit Button (visible on hover) */}
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-smooth h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleLongPress();
            }}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md bg-gradient-soft border-border/50">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Tarea</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Título</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-white/50 border-border/50"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-white/50 border-border/50 resize-none"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="time" className="text-sm font-medium">Hora</Label>
              <Input
                id="time"
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="bg-white/50 border-border/50"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-white/50 border-border/50 hover:bg-white/80"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Guardar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(task.id);
                  setIsEditing(false);
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskItem;