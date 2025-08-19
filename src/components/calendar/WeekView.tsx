import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { format, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "@/types/calendar";

interface WeekViewProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
  onGoToDayView?: (date: Date) => void;
  compact?: boolean; // compact visual variant for quick view
}

const WeekView = ({
  weekDays,
  selectedDate,
  onSelectDate,
  getTasksForDate,
  onGoToDayView,
  compact,
}: WeekViewProps) => {
  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.position = "absolute";
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.borderRadius = "9999px";
    ripple.style.background = "rgba(236,72,153,0.2)";
    ripple.style.transform = "scale(0)";
    ripple.style.transition =
      "transform 450ms ease-out, opacity 600ms ease-out";
    ripple.style.pointerEvents = "none";
    ripple.style.opacity = "1";
    target.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = "scale(1)";
      ripple.style.opacity = "0";
    });
    ripple.addEventListener(
      "transitionend",
      () => {
        ripple.remove();
      },
      { once: true }
    );
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<HTMLDivElement[]>([]);
  const [indicator, setIndicator] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const prevIndexRef = useRef<number>(-1);

  const updateIndicator = () => {
    const idx = weekDays.findIndex((d) => isSameDay(d, selectedDate));
    if (idx < 0) return;
    const el = cellRefs.current[idx];
    if (!el) return;
    const parent = containerRef.current;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setIndicator({
      left: rect.left - parentRect.left,
      top: rect.top - parentRect.top,
      width: rect.width,
      height: rect.height,
    });
    prevIndexRef.current = idx;
  };

  useLayoutEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, weekDays, compact]);

  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative bg-white/40 backdrop-blur-sm rounded-2xl ${
        compact
          ? "p-3 sm:p-4 flex items-center justify-center min-h-[120px]"
          : "p-4 sm:p-6"
      } shadow-soft`}
    >
      {!compact && (
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
          Semana de {format(weekDays[0], "dd MMM", { locale: es })}
        </h3>
      )}

      {/* Sliding selection indicator */}
      {indicator && (
        <div
          className={`absolute left-0 z-0 rounded-2xl bg-gradient-primary shadow-pastel transition-all duration-300 ease-out`}
          style={{
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
          }}
          aria-hidden
        />
      )}

      <div
        className={`relative z-10 grid grid-cols-7 ${
          compact ? "gap-1" : "gap-1 sm:gap-2 lg:gap-3"
        }`}
      >
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const completedTasks = dayTasks.filter((task) => task.completed);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              onClick={() =>
                onGoToDayView ? onGoToDayView(day) : onSelectDate(day)
              }
              onMouseDown={createRipple}
              ref={(el) => {
                if (el) cellRefs.current[index] = el;
              }}
              className={
                compact
                  ? `relative overflow-hidden px-2 py-2 sm:px-3 sm:py-2.5 rounded-2xl cursor-pointer transition-smooth active:scale-95 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                       flex flex-col items-center justify-center gap-0.5 text-center select-none whitespace-nowrap
                       h-[72px] sm:h-[80px]
                       ${
                         isSelected
                           ? "bg-white/0 text-white"
                           : isCurrentDay
                           ? "bg-white/80 text-foreground"
                           : "bg-white/60 text-foreground/90"
                       }
                     `
                  : `relative overflow-hidden p-2 sm:p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      isSelected ? "" : "hover:scale-105"
                    } active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                       ${
                         isSelected
                           ? "bg-white/0 text-white"
                           : isCurrentDay
                           ? "bg-primary-soft text-foreground border-2 border-primary/30"
                           : "bg-white/50 text-foreground"
                       } ${isSelected ? "" : "hover:bg-white/80"}`
              }
            >
              {/* Day Name */}
              <div
                className={`uppercase ${
                  compact ? "text-[10px]" : "text-[10px] sm:text-xs"
                } font-medium text-center ${compact ? "" : "mb-1 sm:mb-2"}
                ${
                  isSelected
                    ? "text-white/80"
                    : compact
                    ? "text-foreground/60"
                    : "text-muted-foreground"
                } ${
                  compact
                    ? "h-[12px] sm:h-[14px] flex items-center justify-center"
                    : ""
                } whitespace-nowrap`}
              >
                {format(day, "EEE", { locale: es }).toUpperCase()}
              </div>

              {/* Day Number */}
              <div
                className={`${
                  compact
                    ? "text-lg sm:text-xl"
                    : "text-sm sm:text-lg lg:text-xl"
                } font-bold text-center leading-none ${
                  compact ? "" : "mb-1 sm:mb-2"
                }
                ${isSelected ? "text-white" : "text-foreground"}`}
              >
                {format(day, "d")}
              </div>

              {/* Tasks Indicator */}
              {dayTasks.length > 0 ? (
                compact ? (
                  <div
                    className={`text-[10px] leading-none text-center ${
                      isSelected ? "text-white/90" : "text-foreground/60"
                    }`}
                  >
                    {completedTasks.length}/{dayTasks.length}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div
                      className={`flex justify-center gap-1 text-xs
                      ${isSelected ? "text-white/80" : "text-muted-foreground"}
                   `}
                    >
                      <span>
                        {completedTasks.length}/{dayTasks.length}
                      </span>
                    </div>
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-1">
                      {dayTasks.slice(0, 3).map((task, taskIndex) => (
                        <div
                          key={taskIndex}
                          className={`w-2 h-2 rounded-full transition-smooth
                            ${
                              task.completed
                                ? isSelected
                                  ? "bg-white"
                                  : "bg-primary"
                                : isSelected
                                ? "bg-white/40"
                                : "bg-primary/30"
                            }`}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <div
                          className={`w-2 h-2 rounded-full
                          ${isSelected ? "bg-white/60" : "bg-primary/60"}
                        `}
                        />
                      )}
                    </div>
                  </div>
                )
              ) : compact ? (
                <div className="text-[10px] leading-none text-center opacity-0">
                  0/0
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default WeekView;
