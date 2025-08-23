import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewType } from "@/types/calendar";

interface CalendarHeaderProps {
  selectedDate: Date;
  view: ViewType;
  onNavigate: (direction: "prev" | "next") => void;
  onViewChange: (view: ViewType) => void;
}

const CalendarHeader = ({
  selectedDate,
  view,
  onNavigate,
  onViewChange,
}: CalendarHeaderProps) => {
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
    ripple.style.background = "rgba(236,72,153,0.25)";
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

  const createSweep =
    (origin: "left" | "right") => (e: React.MouseEvent<HTMLElement>) => {
      const target = e.currentTarget as HTMLElement;
      const sweep = document.createElement("span");
      sweep.style.position = "absolute";
      sweep.style.inset = "0 0 0 0";
      sweep.style.background =
        "linear-gradient(90deg, rgba(236,72,153,0.25), rgba(236,72,153,0))";
      sweep.style.transformOrigin = origin === "left" ? "0 50%" : "100% 50%";
      sweep.style.transform = "scaleX(0)";
      sweep.style.transition =
        "transform 420ms ease-out, opacity 540ms ease-out";
      sweep.style.opacity = "1";
      sweep.style.pointerEvents = "none";
      target.appendChild(sweep);
      requestAnimationFrame(() => {
        sweep.style.transform = "scaleX(1)";
        sweep.style.opacity = "0";
      });
      sweep.addEventListener("transitionend", () => sweep.remove(), {
        once: true,
      });
    };

  const getFormattedDate = () => {
    switch (view) {
      case "day":
        return format(selectedDate, "EEEE, d MMMM yyyy", { locale: es });
      case "week":
        return format(selectedDate, "MMMM yyyy", { locale: es });
      case "month":
        return format(selectedDate, "MMMM yyyy", { locale: es });
      case "year":
        return format(selectedDate, "yyyy", { locale: es });
      default:
        return format(selectedDate, "MMMM yyyy", { locale: es });
    }
  };

  const viewButtons: { key: ViewType; label: string }[] = [
    { key: "day", label: "Día" },
    { key: "week", label: "Semana" },
    { key: "month", label: "Mes" },
    { key: "year", label: "Año" },
  ];

  return (
    <div className="bg-gradient-soft rounded-2xl p-4 sm:p-6 shadow-soft">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("prev")}
          onMouseDown={createSweep("right")}
          className="relative overflow-hidden h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/50 hover:bg-white/80 active:scale-95 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground capitalize text-center px-2 min-w-0 flex-1">
          {getFormattedDate()}
        </h1>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("next")}
          onMouseDown={createSweep("left")}
          className="relative overflow-hidden h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/50 hover:bg-white/80 active:scale-95 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <TabsWithIndicator
          view={view}
          onViewChange={onViewChange}
          viewButtons={viewButtons}
        />
      </div>
    </div>
  );
};

export default CalendarHeader;

// Sliding indicator tabs component
interface TabsProps {
  view: ViewType;
  onViewChange: (v: ViewType) => void;
  viewButtons: { key: ViewType; label: string }[];
}

const TabsWithIndicator = ({ view, onViewChange, viewButtons }: TabsProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<HTMLButtonElement[]>([]);
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const update = useCallback(() => {
    const idx = viewButtons.findIndex((b) => b.key === view);
    const el = btnRefs.current[idx];
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    const r1 = wrap.getBoundingClientRect();
    const r2 = el.getBoundingClientRect();
    const padding = 4;
    setPos({
      left: r2.left - r1.left + padding / 2,
      top: r2.top - r1.top + padding / 2,
      width: r2.width - padding,
      height: r2.height - padding,
    });
  }, [view, viewButtons]);

  useLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [update]);

  return (
    <div
      ref={wrapRef}
      className="relative flex bg-white/50 rounded-full p-1 gap-1 w-full sm:w-fit max-w-sm"
    >
      {pos && (
        <div
          className="absolute rounded-full bg-gradient-primary shadow-soft transition-all duration-300 ease-out"
          style={{
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height,
          }}
          aria-hidden="true"
        />
      )}
      {viewButtons.map(({ key, label }, i) => (
        <Button
          key={key}
          ref={(el) => {
            if (el) btnRefs.current[i] = el;
          }}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(key)}
          className={`relative z-10 rounded-full text-xs sm:text-sm font-medium transition-smooth active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 px-3 sm:px-4 py-1.5 sm:py-2 flex-1 sm:flex-initial ${
            view === key
              ? "text-white hover:text-white hover:bg-transparent"
              : "hover:bg-white/60 text-muted-foreground hover:text-muted-foreground"
          }`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
