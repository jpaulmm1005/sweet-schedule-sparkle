import { format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '@/types/calendar';

interface WeekViewProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
  onGoToDayView?: (date: Date) => void;
  compact?: boolean; // compact visual variant for quick view
}

const WeekView = ({ weekDays, selectedDate, onSelectDate, getTasksForDate, onGoToDayView, compact }: WeekViewProps) => {
  return (
    <div className={`bg-white/40 backdrop-blur-sm rounded-2xl ${compact ? 'p-3 sm:p-4 flex items-center justify-center min-h-[120px]' : 'p-4 sm:p-6'} shadow-soft`}>
      {!compact && (
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
          Semana de {format(weekDays[0], 'dd MMM', { locale: es })}
        </h3>
      )}
      
      <div className={`grid grid-cols-7 ${compact ? 'gap-1' : 'gap-1 sm:gap-2 lg:gap-3'}`}>
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const completedTasks = dayTasks.filter(task => task.completed);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={index}
              onClick={() => (onGoToDayView ? onGoToDayView(day) : onSelectDate(day))}
              className={
                compact
                  ? `px-2 py-2 sm:px-3 sm:py-2.5 rounded-2xl cursor-pointer transition-smooth
                      flex flex-col items-center justify-center gap-0.5 text-center select-none
                      h-[72px] sm:h-[80px]
                      ${isSelected
                        ? 'bg-gradient-primary text-white shadow-pastel'
                        : isCurrentDay
                          ? 'bg-white/80 text-foreground'
                          : 'bg-white/60 text-foreground/90'}
                    `
                  : `p-2 sm:p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105
                      ${isSelected
                        ? 'bg-gradient-primary text-white shadow-pastel'
                        : isCurrentDay
                          ? 'bg-primary-soft text-foreground border-2 border-primary/30'
                          : 'bg-white/50 hover:bg-white/80 text-foreground'}`
              }
            >
              {/* Day Name */}
              <div
                className={`uppercase ${compact ? 'text-[10px]' : 'text-[10px] sm:text-xs'} font-medium text-center ${compact ? '' : 'mb-1 sm:mb-2'}
                ${isSelected ? 'text-white/80' : compact ? 'text-foreground/60' : 'text-muted-foreground'} ${compact ? 'h-[12px] sm:h-[14px] flex items-center justify-center' : ''}`}
              >
                {format(day, 'EEE', { locale: es }).toUpperCase()}
              </div>
              
              {/* Day Number */}
              <div
                className={`${compact ? 'text-lg sm:text-xl' : 'text-sm sm:text-lg lg:text-xl'} font-bold text-center leading-none ${compact ? '' : 'mb-1 sm:mb-2'}
                ${isSelected ? 'text-white' : 'text-foreground'}`}
              >
                {format(day, 'd')}
              </div>
              
              {/* Tasks Indicator */}
              {dayTasks.length > 0 ? (
                compact ? (
                  <div className={`text-[10px] leading-none text-center ${isSelected ? 'text-white/90' : 'text-foreground/60'}`}>
                    {completedTasks.length}/{dayTasks.length}
                  </div>
                ) : (
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
                )
              ) : (
                compact ? (
                  <div className="text-[10px] leading-none text-center opacity-0">0/0</div>
                ) : null
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
;

export default WeekView;