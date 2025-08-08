import { useState } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import CalendarHeader from './CalendarHeader';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AddTaskDialog from './AddTaskDialog';

const CalendarApp = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  
  const {
    selectedDate,
    view,
    weekDays,
    monthDays,
    selectedDateTasks,
    navigateDate,
    setView,
    selectDate,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    getTasksForDate,
  } = useCalendar();

  const handleAddTask = () => {
    setShowAddTask(true);
  };

  const renderView = () => {
    switch (view) {
      case 'day':
        return (
          <DayView
            selectedDate={selectedDate}
            tasks={selectedDateTasks}
            onToggleTask={toggleTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onAddTask={handleAddTask}
          />
        );
      case 'week':
        return (
          <WeekView
            weekDays={weekDays}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            getTasksForDate={getTasksForDate}
          />
        );
      case 'month':
        return (
          <MonthView
            monthDays={monthDays}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            getTasksForDate={getTasksForDate}
          />
        );
      case 'year':
        return (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Vista Anual - Próximamente
            </h3>
            <p className="text-muted-foreground">
              La vista anual estará disponible en una próxima actualización.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peach p-4 space-y-6">
      <div className="max-w-md mx-auto space-y-6">
        <CalendarHeader
          selectedDate={selectedDate}
          view={view}
          onNavigate={navigateDate}
          onViewChange={setView}
        />
        
        {renderView()}
      </div>

      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        selectedDate={selectedDate}
        onAddTask={addTask}
      />
    </div>
  );
};

export default CalendarApp;