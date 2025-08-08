export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM format
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ViewType = 'day' | 'week' | 'month' | 'year';

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date;
  view: ViewType;
  tasks: Task[];
}