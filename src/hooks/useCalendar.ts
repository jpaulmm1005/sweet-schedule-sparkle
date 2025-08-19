import { useState, useMemo, useEffect } from "react";
import {
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { Task, ViewType, CalendarState } from "@/types/calendar";

// Mock tasks data - fallback if no local data
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Gym & Cardio",
    description: "Morning workout routine",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "08:00",
    completed: false,
    priority: "medium",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Team Call",
    description: "Weekly team sync meeting",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "11:00",
    completed: true,
    priority: "high",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Marketing Afternoon",
    description: "Review marketing campaigns",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "15:00",
    completed: false,
    priority: "low",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const STORAGE_KEY = "sweet-schedule-sparkle:tasks";

function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockTasks;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return mockTasks;
    return (parsed as Array<Partial<Task>>).map((t, i) => {
      const id = t.id ? String(t.id) : `${Date.now()}_${i}`;
      const title = t.title ?? "Sin título";
      const description = t.description ?? "";
      const date = t.date ?? format(new Date(), "yyyy-MM-dd");
      const time = t.time ?? "";
      const completed = Boolean(t.completed);
      const priority =
        t.priority === "low" || t.priority === "high" || t.priority === "medium"
          ? t.priority
          : "medium";
      const createdAt = t.createdAt ? new Date(t.createdAt) : new Date();
      const updatedAt = t.updatedAt ? new Date(t.updatedAt) : new Date();
      return {
        id,
        title,
        description,
        date,
        time,
        completed,
        priority,
        createdAt,
        updatedAt,
      } as Task;
    });
  } catch {
    // If parsing/storage fails, fallback to mock data
    return mockTasks;
  }
}

export const useCalendar = () => {
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    selectedDate: new Date(),
    view: "day",
    tasks: loadTasksFromStorage(),
  });

  // Persist tasks on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (e) {
      console.warn("Failed to persist tasks", e);
    }
  }, [state.tasks]);

  const navigateDate = (direction: "prev" | "next") => {
    setState((prev) => {
      let newDate = prev.selectedDate;

      switch (prev.view) {
        case "day":
          newDate =
            direction === "next"
              ? addDays(prev.selectedDate, 1)
              : subDays(prev.selectedDate, 1);
          break;
        case "week":
          newDate =
            direction === "next"
              ? addDays(prev.selectedDate, 7)
              : subDays(prev.selectedDate, 7);
          break;
        case "month":
          newDate =
            direction === "next"
              ? addMonths(prev.selectedDate, 1)
              : subMonths(prev.selectedDate, 1);
          break;
        case "year":
          newDate =
            direction === "next"
              ? addYears(prev.selectedDate, 1)
              : subYears(prev.selectedDate, 1);
          break;
      }

      return { ...prev, selectedDate: newDate };
    });
  };

  const setView = (view: ViewType) => {
    setState((prev) => ({ ...prev, view }));
  };

  const selectDate = (date: Date) => {
    setState((prev) => ({ ...prev, selectedDate: date }));
  };

  const toggleTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      ),
    }));
  };

  const addTask = (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }));
  };

  const deleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  };

  // Export/Import helpers
  const exportTasksToTxt = () => {
    const data = JSON.stringify(state.tasks, null, 2);
    const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = format(new Date(), "yyyyMMdd_HHmm");
    a.href = url;
    a.download = `tasks_${stamp}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importTasksFromText = (text: string) => {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (!Array.isArray(parsed)) return;
      // Basic normalization
      const normalized: Task[] = (parsed as Array<Partial<Task>>).map((t) => ({
        id: t.id ? String(t.id) : Date.now().toString(),
        title: t.title ?? "Sin título",
        description: t.description ?? "",
        date: t.date ?? format(new Date(), "yyyy-MM-dd"),
        time: t.time ?? "",
        completed: Boolean(t.completed),
        priority:
          t.priority === "low" || t.priority === "high" || t.priority === "medium"
            ? t.priority
            : "medium",
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        updatedAt: new Date(),
      }));
      setState((prev) => ({ ...prev, tasks: normalized }));
    } catch (e) {
      console.error("Import error:", e);
    }
  };

  // Computed values
  const weekDays = useMemo(() => {
    const start = startOfWeek(state.selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(state.selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [state.selectedDate]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(state.selectedDate);
    const end = endOfMonth(state.selectedDate);
    return eachDayOfInterval({ start, end });
  }, [state.selectedDate]);

  const selectedDateTasks = useMemo(() => {
    const dateString = format(state.selectedDate, "yyyy-MM-dd");
    return state.tasks.filter((task) => task.date === dateString);
  }, [state.tasks, state.selectedDate]);

  const getTasksForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return state.tasks.filter((task) => task.date === dateString);
  };

  return {
    ...state,
    navigateDate,
    setView,
    selectDate,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    exportTasksToTxt,
    importTasksFromText,
    weekDays,
    monthDays,
    selectedDateTasks,
    getTasksForDate,
  };
};
