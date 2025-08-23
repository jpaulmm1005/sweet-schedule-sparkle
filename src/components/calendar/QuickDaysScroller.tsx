import React, { useEffect, useMemo, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { addDays, format, isSameDay, isToday } from "date-fns";
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
  // Ventana de días alrededor de la fecha seleccionada
  const windowSize = 120;
  const half = Math.floor(windowSize / 2);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = -half; i <= half; i++) {
      arr.push(addDays(selectedDate, i));
    }
    return arr;
  }, [selectedDate, half]);

  const initialIndex = useMemo(() => half, [half]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    containScroll: "keepSnaps",
    dragFree: true,
    skipSnaps: false,
    startIndex: initialIndex,
    inViewThreshold: 1, // Ensure the selected slide is fully in view
  });

  const hasCenteredOnMount = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  // Centrar SOLO al montar (una vez)
  const centerOnMount = useCallback(() => {
    if (!emblaApi || hasCenteredOnMount.current) return;
    hasCenteredOnMount.current = true;
    // Espera un frame para que el layout esté listo
    requestAnimationFrame(() => {
      emblaApi.scrollTo(initialIndex);
    });
  }, [emblaApi, initialIndex]);

  // Efecto para manejar el scroll cuando cambia la fecha seleccionada
  useEffect(() => {
    if (!emblaApi) return;

    // Encuentra el índice del día seleccionado en el array de días
    const selectedIndex = days.findIndex((day) => isSameDay(day, selectedDate));
    if (selectedIndex !== -1) {
      // No pasar el segundo parámetro para usar la animación por defecto
      emblaApi.scrollTo(selectedIndex);
    }
  }, [selectedDate, days, emblaApi]);

  useEffect(() => {
    centerOnMount();
  }, [centerOnMount]);

  // Recalcular en resize sin romper la posición actual
  useEffect(() => {
    if (!emblaApi) return;

    const onResize = () => {
      if (scrollTimeout.current !== null) {
        window.clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = window.setTimeout(() => {
        emblaApi.reInit();
        // Mantén el snap actual (no recentrar)
        emblaApi.scrollTo(emblaApi.selectedScrollSnap());
      }, 120);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (scrollTimeout.current !== null) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
  }, [emblaApi]);

  const handleDateSelect = useCallback(
    (day: Date) => {
      onSelectDate(day); // NO hacemos scroll aquí
    },
    [onSelectDate]
  );

  return (
    <div className="embla w-full">
      <div ref={emblaRef} className="embla__viewport w-full">
        <div className="embla__container flex items-center justify-center">
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
                  onClick={() => handleDateSelect(day)}
                  className={`relative overflow-hidden px-1.5 py-2 rounded-xl cursor-pointer transition-smooth active:scale-95 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                    flex flex-col items-center justify-center gap-1 text-center select-none whitespace-nowrap
                    min-w-[42px] max-w-[42px] flex-shrink-0
                    ${
                      isSel
                        ? "bg-gradient-primary text-white shadow-pastel"
                        : isCur
                        ? "bg-white/80 text-foreground"
                        : "bg-white/60 text-foreground/90 hover:bg-white/80"
                    }`}
                  aria-current={isSel ? "date" : undefined}
                  aria-label={format(day, "EEEE d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                >
                  <div
                    className={`text-[10px] font-medium uppercase leading-none ${
                      isSel ? "text-white/90" : "text-foreground/60"
                    }`}
                  >
                    {format(day, "EEE", { locale: es })}
                  </div>
                  <div className="text-lg font-bold leading-none">
                    {format(day, "d")}
                  </div>
                  {dayTasks.length > 0 ? (
                    <div
                      className={`text-[10px] leading-none ${
                        isSel ? "text-white/80" : "text-foreground/60"
                      }`}
                    >
                      {completed}/{dayTasks.length}
                    </div>
                  ) : (
                    <div className="text-[10px] leading-none opacity-0">
                      0/0
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .embla { 
          width: 100%;
          position: relative;
        }
        .embla__viewport { 
          overflow: hidden; 
          width: 100%;
        }
        .embla__container { 
          will-change: transform; 
          display: flex;
          margin: 0 auto;
          position: relative;
          backface-visibility: hidden;
        }
        .embla__slide { 
          flex: 0 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 42px;
          margin: 0 2px; /* Equal margin on both sides for better centering */
        }
        .embla__slide:last-child {
          margin-right: 2px;
        }
        .transition-smooth { transition: all 0.2s ease-in-out; }
      `}</style>
    </div>
  );
}
