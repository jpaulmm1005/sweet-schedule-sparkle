import { format, isSameDay, isToday, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '@/types/calendar';

interface MonthViewProps {
  monthDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
}

const MonthView = ({ monthDays, selectedDate, onSelectDate, getTasksForDate }: MonthViewProps) => {
  // Get first day of the month to calculate calendar grid
  const firstDay = monthDays[0];
  const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayStartDay = startDay === 0 ? 6 : startDay - 1; // Convert to Monday start
  
  // Create array with empty cells for previous month days
  const calendarDays = Array.from({ length: mondayStartDay }, () => null).concat(monthDays);
  
  // Add empty cells to complete the grid (42 cells = 6 rows × 7 days)
  while (calendarDays.length < 42) {
    calendarDays.push(null);
  }

  const weekdays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {format(selectedDate, 'MMMM yyyy', { locale: es })}
      </h3>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekdays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square" />;
          }
          
          const dayTasks = getTasksForDate(day);
          const completedTasks = dayTasks.filter(task => task.completed);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          
          return (
            <div
              key={index}
              onClick={() => onSelectDate(day)}
              className={`aspect-square p-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col
                ${isSelected 
                  ? 'bg-gradient-primary text-white shadow-pastel' 
                  : isCurrentDay
                    ? 'bg-primary-soft text-foreground border-2 border-primary/30'
                    : isCurrentMonth
                      ? 'bg-white/50 hover:bg-white/80 text-foreground'
                      : 'bg-transparent text-muted-foreground/40'
                }`}
            >
              {/* Day Number */}
              <div className={`text-sm font-medium text-center mb-1
                ${isSelected ? 'text-white' : 'text-foreground'}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* Tasks Indicator */}
              {dayTasks.length > 0 && isCurrentMonth && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  {/* Main Task Title (only first one) */}
                  <div className={`text-[8px] text-center leading-tight mb-1 line-clamp-2
                    ${dayTasks[0].completed
                      ? isSelected 
                        ? 'text-white/80 line-through' 
                        : 'text-muted-foreground line-through'
                      : isSelected 
                        ? 'text-white' 
                        : 'text-foreground'
                    }`}
                  >
                    {dayTasks[0].title}
                  </div>
                  
                  {/* Task Dots */}
                  <div className="flex gap-[2px] flex-wrap justify-center">
                    {dayTasks.slice(0, 4).map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className={`w-1 h-1 rounded-full
                          ${task.completed
                            ? isSelected 
                              ? 'bg-white' 
                              : 'bg-primary'
                            : isSelected 
                              ? 'bg-white/50' 
                              : 'bg-primary/50'
                          }`}
                      />
                    ))}
                    {dayTasks.length > 4 && (
                      <div className={`w-1 h-1 rounded-full
                        ${isSelected ? 'bg-white/70' : 'bg-primary/70'}
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

export default MonthView;