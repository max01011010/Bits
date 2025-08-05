import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays, addWeeks, addMonths, addYears, isAfter, parseISO } from 'date-fns';

export interface Milestone {
  goal: string; // e.g., "Walk 1000 steps"
  targetDays: number; // e.g., 3 days a week
  completedDays: number; // how many days completed for this milestone
  isCompleted: boolean;
}

export interface Habit {
  id: string;
  user_id: string; // Added user_id to link to Supabase auth.users
  name: string; // The end goal, e.g., "Walk 7000 steps a day"
  current_streak: number; // Renamed to match snake_case for Supabase
  last_completed_date: string | null; // ISO date string, renamed for Supabase
  milestones: Milestone[];
  created_at: string; // ISO date string, renamed for Supabase
  repeat_mode: 'forever' | 'duration'; // 'forever' or 'duration'
  repeat_duration_value: number | null; // e.g., 3
  repeat_duration_unit: 'days' | 'weeks' | 'months' | 'years' | null; // e.g., 'weeks'
  is_active: boolean; // True if the habit is currently active (for duration-based habits)
  start_date: string; // Date when the habit was created or last reset (ISO date string)
  completion_count: number; // How many times this habit has been fully completed
}

export const getHabits = async (userId: string): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching habits:', error);
    toast.error('Failed to load habits.');
    return [];
  }
  return data as Habit[];
};

export const addHabit = async (
  userId: string,
  name: string,
  milestones: Milestone[],
  repeatMode: 'forever' | 'duration' = 'forever', // Default to forever
  repeatDurationValue: number | null = null,
  repeatDurationUnit: 'days' | 'weeks' | 'months' | 'years' | null = null
): Promise<Habit | null> => {
  const newHabit = {
    user_id: userId,
    name,
    current_streak: 0,
    last_completed_date: null,
    milestones,
    created_at: new Date().toISOString(),
    repeat_mode: repeatMode,
    repeat_duration_value: repeatDurationValue,
    repeat_duration_unit: repeatDurationUnit,
    is_active: true, // New habits are always active
    start_date: new Date().toISOString().split('T')[0], // Set start date to today
    completion_count: 0,
  };

  const { data, error } = await supabase
    .from('habits')
    .insert([newHabit])
    .select()
    .single();

  if (error) {
    console.error('Error adding habit:', error);
    toast.error('Failed to add habit.');
    return null;
  }
  return data as Habit;
};

export const updateHabit = async (updatedHabit: Habit): Promise<Habit | null> => {
  const { data, error } = await supabase
    .from('habits')
    .update(updatedHabit)
    .eq('id', updatedHabit.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating habit:', error);
    toast.error('Failed to update habit.');
    return null;
  }
  return data as Habit;
};

export const deleteHabit = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting habit:', error);
    toast.error('Failed to delete habit.');
    return false;
  }
  return true;
};

// Helper function to calculate end date for duration-based habits
const calculateEndDate = (startDate: string, value: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date => {
  let date = parseISO(startDate);
  switch (unit) {
    case 'days':
      date = addDays(date, value);
      break;
    case 'weeks':
      date = addWeeks(date, value);
      break;
    case 'months':
      date = addMonths(date, value);
      break;
    case 'years':
      date = addYears(date, value);
      break;
  }
  return date;
};

export const markHabitCompleted = async (habitId: string, userId: string): Promise<boolean> => {
  const { data: habits, error: fetchError } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !habits) {
    console.error('Error fetching habit to mark completed:', fetchError);
    toast.error('Failed to find habit to mark completed.');
    return false;
  }

  const habit = habits as Habit;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // If habit is not active, it cannot be marked completed
  if (!habit.is_active) {
    toast.info('This habit is no longer active.');
    return false;
  }

  const lastCompletionDay = habit.last_completed_date ? new Date(habit.last_completed_date).toISOString().split('T')[0] : null;

  if (lastCompletionDay === today) {
    // Already marked for today, do nothing
    toast.info('Habit already marked completed for today.');
    return true;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  let newStreak = habit.current_streak;
  if (lastCompletionDay === yesterdayString) {
    newStreak += 1;
  } else if (lastCompletionDay !== today) {
    // If not completed yesterday and not today, reset streak
    newStreak = 1;
  }

  // Update current milestone's completed days
  let updatedMilestones = habit.milestones.map((milestone, index) => {
    if (!milestone.isCompleted && index === 0) { // Assuming the first incomplete milestone is the current one
      return { ...milestone, completedDays: milestone.completedDays + 1 };
    }
    return milestone;
  });

  let newIsActive = habit.is_active;
  let newCompletionCount = habit.completion_count;
  let newStartDate = habit.start_date; // Keep original start date unless reset

  // Check if the current milestone is now completed
  const firstUncompletedMilestoneIndex = updatedMilestones.findIndex(m => !m.isCompleted);
  if (firstUncompletedMilestoneIndex === -1) { // All milestones are completed
    newCompletionCount += 1; // Increment completion count for the habit

    if (habit.repeat_mode === 'forever') {
      // Reset all milestones for a new cycle
      updatedMilestones = habit.milestones.map(m => ({
        ...m,
        completedDays: 0,
        isCompleted: false,
      }));
      toast.success(`Habit "${habit.name}" completed a cycle and reset!`);
    } else if (habit.repeat_mode === 'duration' && habit.repeat_duration_value && habit.repeat_duration_unit) {
      const endDate = calculateEndDate(habit.start_date, habit.repeat_duration_value, habit.repeat_duration_unit);
      const now = new Date();

      if (isAfter(now, endDate)) {
        // Duration has passed, mark habit as inactive
        newIsActive = false;
        toast.info(`Habit "${habit.name}" duration ended. It is now inactive.`);
      } else {
        // Duration has not passed, reset milestones for a new cycle
        updatedMilestones = habit.milestones.map(m => ({
          ...m,
          completedDays: 0,
          isCompleted: false,
        }));
        // Optionally, reset start_date to today if a new cycle begins within the duration
        // For simplicity, we'll keep the original start_date for duration calculation
        toast.success(`Habit "${habit.name}" completed a cycle and reset!`);
      }
    }
  }

  const { error: updateError } = await supabase
    .from('habits')
    .update({
      current_streak: newStreak,
      last_completed_date: today,
      milestones: updatedMilestones,
      is_active: newIsActive,
      completion_count: newCompletionCount,
      start_date: newStartDate, // Ensure start_date is not accidentally changed
    })
    .eq('id', habitId)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating habit completion:', updateError);
    toast.error('Failed to mark habit completed.');
    return false;
  }
  return true;
};