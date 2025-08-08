import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewType } from '@/types/calendar';

interface CalendarHeaderProps {
  selectedDate: Date;
  view: ViewType;
  onNavigate: (direction: 'prev' | 'next') => void;
  onViewChange: (view: ViewType) => void;
}

const CalendarHeader = ({ selectedDate, view, onNavigate, onViewChange }: CalendarHeaderProps) => {
  const getFormattedDate = () => {
    switch (view) {
      case 'day':
        return format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es });
      case 'week':
        return format(selectedDate, 'MMMM yyyy', { locale: es });
      case 'month':
        return format(selectedDate, 'MMMM yyyy', { locale: es });
      case 'year':
        return format(selectedDate, 'yyyy', { locale: es });
      default:
        return format(selectedDate, 'MMMM yyyy', { locale: es });
    }
  };

  const viewButtons: { key: ViewType; label: string }[] = [
    { key: 'day', label: 'Día' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
    { key: 'year', label: 'Año' },
  ];

  return (
    <div className="bg-gradient-soft rounded-2xl p-4 sm:p-6 shadow-soft">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('prev')}
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/50 hover:bg-white/80 transition-smooth"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground capitalize text-center px-2">
          {getFormattedDate()}
        </h1>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('next')}
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/50 hover:bg-white/80 transition-smooth"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex bg-white/50 rounded-full p-1 gap-1">
        {viewButtons.map(({ key, label }) => (
          <Button
            key={key}
            variant={view === key ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(key)}
            className={`flex-1 rounded-full text-xs sm:text-sm font-medium transition-smooth ${
              view === key 
                ? 'bg-primary text-primary-foreground shadow-soft' 
                : 'hover:bg-white/60 text-muted-foreground'
            }`}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CalendarHeader;