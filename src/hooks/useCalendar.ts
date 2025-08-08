import { useState, useMemo } from 'react';
import { format, addDays, subDays, addMonths, subMonths, addYears, subYears, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { Task, ViewType, CalendarState } from '@/types/calendar';

// Mock tasks data - replace with Supabase integration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Gym & Cardio',
    description: 'Morning workout routine',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '08:00',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Team Call',
    description: 'Weekly team sync meeting',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '11:00',
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Marketing Afternoon',
    description: 'Review marketing campaigns',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '15:00',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const useCalendar = () => {
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    selectedDate: new Date(),
    view: 'day',
    tasks: mockTasks,
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    setState(prev => {
      let newDate = prev.selectedDate;
      
      switch (prev.view) {
        case 'day':
          newDate = direction === 'next' ? addDays(prev.selectedDate, 1) : subDays(prev.selectedDate, 1);
          break;
        case 'week':
          newDate = direction === 'next' ? addDays(prev.selectedDate, 7) : subDays(prev.selectedDate, 7);
          break;
        case 'month':
          newDate = direction === 'next' ? addMonths(prev.selectedDate, 1) : subMonths(prev.selectedDate, 1);
          break;
        case 'year':
          newDate = direction === 'next' ? addYears(prev.selectedDate, 1) : subYears(prev.selectedDate, 1);
          break;
      }
      
      return { ...prev, selectedDate: newDate };
    });
  };

  const setView = (view: ViewType) => {
    setState(prev => ({ ...prev, view }));
  };

  const selectDate = (date: Date) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const toggleTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      ),
    }));
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }));
  };

  const deleteTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
    }));
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
    const dateString = format(state.selectedDate, 'yyyy-MM-dd');
    return state.tasks.filter(task => task.date === dateString);
  }, [state.tasks, state.selectedDate]);

  const getTasksForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return state.tasks.filter(task => task.date === dateString);
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
    weekDays,
    monthDays,
    selectedDateTasks,
    getTasksForDate,
  };
};