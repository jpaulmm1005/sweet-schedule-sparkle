import { format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '@/types/calendar';

interface WeekViewProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
}

const WeekView = ({ weekDays, selectedDate, onSelectDate, getTasksForDate }: WeekViewProps) => {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Semana de {format(weekDays[0], 'dd MMM', { locale: es })}
      </h3>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const completedTasks = dayTasks.filter(task => task.completed);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={index}
              onClick={() => onSelectDate(day)}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105
                ${isSelected 
                  ? 'bg-gradient-primary text-white shadow-pastel' 
                  : isCurrentDay
                    ? 'bg-primary-soft text-foreground border-2 border-primary/30'
                    : 'bg-white/50 hover:bg-white/80 text-foreground'
                }`}
            >
              {/* Day Name */}
              <div className={`text-xs font-medium text-center mb-2 
                ${isSelected ? 'text-white/80' : 'text-muted-foreground'}
              `}>
                {format(day, 'EEE', { locale: es }).toUpperCase()}
              </div>
              
              {/* Day Number */}
              <div className={`text-lg font-bold text-center mb-2
                ${isSelected ? 'text-white' : 'text-foreground'}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* Tasks Indicator */}
              {dayTasks.length > 0 && (
                <div className="space-y-1">
                  <div className={`flex justify-center gap-1 text-xs
                    ${isSelected ? 'text-white/80' : 'text-muted-foreground'}
                  `}>
                    <span>{completedTasks.length}/{dayTasks.length}</span>
                  </div>
                  
                  {/* Progress Dots */}
                  <div className="flex justify-center gap-1">
                    {dayTasks.slice(0, 3).map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className={`w-2 h-2 rounded-full transition-smooth
                          ${task.completed
                            ? isSelected 
                              ? 'bg-white' 
                              : 'bg-primary'
                            : isSelected 
                              ? 'bg-white/40' 
                              : 'bg-primary/30'
                          }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <div className={`w-2 h-2 rounded-full
                        ${isSelected ? 'bg-white/60' : 'bg-primary/60'}
                      `} />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;