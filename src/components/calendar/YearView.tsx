import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "@/types/calendar";

interface YearViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
  onGoToDayView: (date: Date) => void;
  onGoToMonthView?: (date: Date) => void;
}

const weekdays = ["L", "M", "X", "J", "V", "S", "D"];

function getMonthDays(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });

  // Convert Sunday-start to Monday-start offset
  const startDay = start.getDay(); // 0 sun - 6 sat
  const mondayStartDay = startDay === 0 ? 6 : startDay - 1;

  const grid: (Date | null)[] = Array.from(
    { length: mondayStartDay },
    () => null
  ).concat(days);
  while (grid.length < 42) grid.push(null);
  return grid;
}

const MiniMonth = ({
  monthDate,
  selectedDate,
  onSelectDate,
  onGoToDayView,
  onGoToMonthView,
  getTasksForDate,
}: {
  monthDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onGoToDayView: (date: Date) => void;
  onGoToMonthView?: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
}) => {
  const days = getMonthDays(monthDate);

  return (
    <div
      className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-soft cursor-pointer"
      onClick={() => onGoToMonthView?.(monthDate)}
      role="button"
      aria-label={`Ver mes ${format(monthDate, 'MMMM', { locale: es })}`}
    >
      <h4 className="text-left w-full text-xs sm:text-sm font-semibold text-foreground mb-2 capitalize">
        {format(monthDate, 'MMMM', { locale: es })}
      </h4>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d) => (
          <div
            key={d}
            className="text-[10px] sm:text-xs text-muted-foreground text-center"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) return <div key={idx} className="aspect-square" />;

          const dayTasks = getTasksForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isCurMonth = isSameMonth(day, monthDate);

          return (
            <button
              type="button"
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onGoToDayView(day);
              }}
              className={`aspect-square p-1 rounded-md flex flex-col items-center justify-center transition-all duration-200
                ${
                  isSelected
                    ? "bg-gradient-primary text-white shadow-pastel"
                    : isCurrentDay
                    ? "bg-primary-soft text-foreground border border-primary/30"
                    : isCurMonth
                    ? "bg-white/50 hover:bg-white/80 text-foreground"
                    : "bg-transparent text-muted-foreground/40"
                }
              `}
            >
              <span
                className={`text-[10px] sm:text-xs leading-none ${
                  isSelected ? "text-white" : ""
                }`}
              >
                {format(day, "d")}
              </span>
              {dayTasks.length > 0 && isCurMonth && (
                <span
                  className={`mt-0.5 inline-block w-1 h-1 rounded-full ${
                    isSelected ? "bg-white/80" : "bg-primary/70"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const YearView = ({
  selectedDate,
  onSelectDate,
  getTasksForDate,
  onGoToDayView,
  onGoToMonthView,
}: YearViewProps) => {
  const baseYear = selectedDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(baseYear, i, 1));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        {format(selectedDate, "yyyy", { locale: es })}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {months.map((m) => (
          <MiniMonth
            key={m.getMonth()}
            monthDate={m}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onGoToDayView={onGoToDayView}
            onGoToMonthView={onGoToMonthView}
            getTasksForDate={getTasksForDate}
          />
        ))}
      </div>
    </div>
  );
};

export default YearView;
