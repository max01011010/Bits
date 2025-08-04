import { v4 as uuidv4 } from 'uuid';

export interface Milestone {
  goal: string; // e.g., "Walk 1000 steps"
  targetDays: number; // e.g., 3 days a week
  completedDays: number; // how many days completed for this milestone
  isCompleted: boolean;
}

export interface Habit {
  id: string;
  name: string; // The end goal, e.g., "Walk 7000 steps a day"
  currentStreak: number;
  lastCompletedDate: string | null; // ISO date string
  milestones: Milestone[];
  createdAt: string; // ISO date string
}

const HABITS_STORAGE_KEY = 'habit_tracker_habits';

export const getHabits = (): Habit[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const habitsJson = localStorage.getItem(HABITS_STORAGE_KEY);
  return habitsJson ? JSON.parse(habitsJson) : [];
};

export const saveHabits = (habits: Habit[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  }
};

export const addHabit = (name: string, milestones: Milestone[]): Habit => {
  const newHabit: Habit = {
    id: uuidv4(),
    name,
    currentStreak: 0,
    lastCompletedDate: null,
    milestones,
    createdAt: new Date().toISOString(),
  };
  const habits = getHabits();
  saveHabits([...habits, newHabit]);
  return newHabit;
};

export const updateHabit = (updatedHabit: Habit): void => {
  const habits = getHabits();
  const updatedHabits = habits.map(habit =>
    habit.id === updatedHabit.id ? updatedHabit : habit
  );
  saveHabits(updatedHabits);
};

export const deleteHabit = (id: string): void => {
  const habits = getHabits();
  const filteredHabits = habits.filter(habit => habit.id !== id);
  saveHabits(filteredHabits);
};

export const markHabitCompleted = (id: string): void => {
  const habits = getHabits();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const updatedHabits = habits.map(habit => {
    if (habit.id === id) {
      const lastCompletionDay = habit.lastCompletedDate ? new Date(habit.lastCompletedDate).toISOString().split('T')[0] : null;
      if (lastCompletionDay === today) {
        // Already marked for today, do nothing
        return habit;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      let newStreak = habit.currentStreak;
      if (lastCompletionDay === yesterdayString) {
        newStreak += 1;
      } else if (lastCompletionDay !== today) {
        // If not completed yesterday and not today, reset streak
        newStreak = 1;
      }

      // Update current milestone's completed days
      const updatedMilestones = habit.milestones.map((milestone, index) => {
        if (!milestone.isCompleted && index === 0) { // Assuming the first incomplete milestone is the current one
          return { ...milestone, completedDays: milestone.completedDays + 1 };
        }
        return milestone;
      });

      return {
        ...habit,
        currentStreak: newStreak,
        lastCompletedDate: today,
        milestones: updatedMilestones,
      };
    }
    return habit;
  });
  saveHabits(updatedHabits);
};