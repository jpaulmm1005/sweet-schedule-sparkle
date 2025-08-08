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
    <div className="bg-gradient-soft rounded-2xl p-6 shadow-soft">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('prev')}
          className="h-10 w-10 rounded-full bg-white/50 hover:bg-white/80 transition-smooth"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-semibold text-foreground capitalize">
          {getFormattedDate()}
        </h1>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('next')}
          className="h-10 w-10 rounded-full bg-white/50 hover:bg-white/80 transition-smooth"
        >
          <ChevronRight className="h-5 w-5" />
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
            className={`flex-1 rounded-full text-sm font-medium transition-smooth ${
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