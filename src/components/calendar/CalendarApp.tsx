import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import YearView from "./YearView";
import AddTaskDialog from "./AddTaskDialog";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";

const CalendarApp = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    exportTasksToTxt,
    importTasksFromText,
  } = useCalendar();

  const handleAddTask = () => {
    setShowAddTask(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importTasksFromText(text);
    } finally {
      // Reset input so the same file can be selected again later
      e.target.value = "";
    }
  };

  const renderView = () => {
    switch (view) {
      case "day":
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
      case "week":
        return (
          <WeekView
            weekDays={weekDays}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            getTasksForDate={getTasksForDate}
            onGoToDayView={(date) => {
              selectDate(date);
              setView("day");
            }}
          />
        );
      case "month":
        return (
          <MonthView
            monthDays={monthDays}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            getTasksForDate={getTasksForDate}
            onGoToDayView={(date) => {
              selectDate(date);
              setView("day");
            }}
          />
        );
      case "year":
        return (
          <YearView
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            getTasksForDate={getTasksForDate}
            onGoToDayView={(date) => {
              selectDate(date);
              setView("day");
            }}
            onGoToMonthView={(date) => {
              selectDate(date);
              setView("month");
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peach p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hidden file input accessible for all layouts */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.json,application/json,text/plain"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* Mobile & Tablet Layout */}
        <div className="lg:hidden space-y-4 sm:space-y-6">
          <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
            <CalendarHeader
              selectedDate={selectedDate}
              view={view}
              onNavigate={navigateDate}
              onViewChange={setView}
            />

            {/* Quick View & Utilitarios for mobile/tablet when in Day view */}
            {view === "day" && (
              <>
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Vista Rápida
                  </h4>
                  <WeekView
                    weekDays={weekDays}
                    selectedDate={selectedDate}
                    onSelectDate={selectDate}
                    getTasksForDate={getTasksForDate}
                    compact
                  />
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Utilitarios
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="w-full justify-center bg-white/60 hover:bg-white/80 text-foreground shadow-soft rounded-xl py-2.5"
                      aria-label="Importar"
                      title="Importar"
                      onClick={handleImportClick}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importar
                    </Button>
                    <Button
                      className="w-full justify-center bg-white/60 hover:bg-white/80 text-foreground shadow-soft rounded-xl py-2.5"
                      aria-label="Exportar"
                      title="Exportar"
                      onClick={exportTasksToTxt}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </>
            )}

            {renderView()}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-6 h-screen max-h-screen">
            {/* Left Sidebar - Calendar Navigation */}
            <div className="col-span-4 xl:col-span-3 space-y-6 overflow-y-auto">
              <CalendarHeader
                selectedDate={selectedDate}
                view={view}
                onNavigate={navigateDate}
                onViewChange={setView}
              />

              {/* Mini Calendar for Desktop + Utilitarios (separate sections) */}
              {view === "day" && (
                <>
                  <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Vista Rápida
                    </h4>
                    <WeekView
                      weekDays={weekDays}
                      selectedDate={selectedDate}
                      onSelectDate={selectDate}
                      getTasksForDate={getTasksForDate}
                      compact
                    />
                  </div>

                  <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Utilitarios
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="w-full justify-center bg-white/60 hover:bg-white/80 text-foreground shadow-soft rounded-xl py-2.5"
                        aria-label="Importar"
                        title="Importar"
                        onClick={handleImportClick}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                      </Button>
                      <Button
                        className="w-full justify-center bg-white/60 hover:bg-white/80 text-foreground shadow-soft rounded-xl py-2.5"
                        aria-label="Exportar"
                        title="Exportar"
                        onClick={exportTasksToTxt}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Main Content Area */}
            <div className="col-span-8 xl:col-span-9 overflow-y-auto">
              {renderView()}
            </div>
          </div>
        </div>
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
