import React, { useEffect, useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "@/types/calendar";

export default function QuickDaysScroller({
  selectedDate,
  onSelectDate,
  getTasksForDate,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  getTasksForDate: (d: Date) => Task[];
}) {
  // Build a wide, loop-friendly window of days around selectedDate
  const windowSize = 120; // total slides = windowSize + 1 (from -60 to +60)
  const half = Math.floor(windowSize / 2);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = -half; i <= half; i++) {
      arr.push(addDays(selectedDate, i));
    }
    return arr;
  }, [selectedDate, half]);

  const initialIndex = useMemo(() => {
    // Center on selectedDate (index = half)
    return half;
  }, [half]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: true,
    containScroll: "trimSnaps",
    skipSnaps: false,
    align: "center",
  });

  const prevSelectedRef = useRef<number>(selectedDate.getTime());

  useEffect(() => {
    if (!emblaApi) return;
    // When selectedDate changes externally, re-center to the middle slide
    if (prevSelectedRef.current !== selectedDate.getTime()) {
      prevSelectedRef.current = selectedDate.getTime();
      emblaApi.reInit();
      // Scroll to center
      emblaApi.scrollTo(initialIndex, true);
    } else {
      // First mount
      emblaApi.scrollTo(initialIndex, true);
    }
  }, [emblaApi, selectedDate, initialIndex]);

  // Keep visual highlight in sync while dragging: when scroll settles near a date, we could infer it,
  // but since we show many days, we'll just keep the explicit click to change selectedDate.

  return (
    <div className="embla">
      <div ref={emblaRef} className="embla__viewport">
        <div className="embla__container flex gap-1">
          {days.map((day, idx) => {
            const dayTasks = getTasksForDate(day);
            const completed = dayTasks.filter((t) => t.completed).length;
            const isSel = isSameDay(day, selectedDate);
            const isCur = isToday(day);
            return (
              <div
                className="embla__slide shrink-0"
                key={`${day.toDateString()}_${idx}`}
              >
                <button
                  type="button"
                  onClick={() => onSelectDate(day)}
                  className={`relative overflow-hidden px-1.5 py-2 rounded-xl cursor-pointer transition-smooth active:scale-95 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                    flex flex-col items-center justify-center gap-1 text-center select-none whitespace-nowrap
                    min-w-[36px]
                    ${
                      isSel
                        ? "bg-gradient-primary text-white shadow-pastel"
                        : isCur
                        ? "bg-white/80 text-foreground"
                        : "bg-white/60 text-foreground/90 hover:bg-white/80"
                    }`}
                  aria-current={isSel ? "date" : undefined}
                  aria-label={format(day, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                >
                  <div className={`text-[10px] font-medium uppercase leading-none ${isSel ? "text-white/90" : "text-foreground/60"}`}>
                    {format(day, "EEE", { locale: es })}
                  </div>
                  <div className="text-lg font-bold leading-none">
                    {format(day, "d")}
                  </div>
                  {dayTasks.length > 0 ? (
                    <div className={`text-[10px] leading-none ${isSel ? "text-white/80" : "text-foreground/60"}`}>
                      {completed}/{dayTasks.length}
                    </div>
                  ) : (
                    <div className="text-[10px] leading-none opacity-0">0/0</div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .embla__viewport { overflow: hidden; }
        .embla__container { will-change: transform; }
        .embla__slide { scroll-snap-align: center; }
      `}</style>
    </div>
  );
}
