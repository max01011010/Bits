import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash2, ListChecks, Repeat, Clock } from 'lucide-react'; // Import Repeat and Clock icons
import { Habit, markHabitCompleted, deleteHabit, updateHabit } from '@/lib/habit-store';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession } from '@/components/SessionContextProvider';
import { addDays, addWeeks, addMonths, addYears, isAfter, parseISO } from 'date-fns'; // Import date-fns utilities

interface HabitCardProps {
  habit: Habit;
  onHabitUpdate: () => void;
}

// Helper function to calculate end date for duration-based habits (duplicated for display)
const calculateEndDateForDisplay = (startDate: string, value: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date => {
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

const HabitCard: React.FC<HabitCardProps> = ({ habit, onHabitUpdate }) => {
  const { user } = useSession();

  const handleMarkCompleted = async () => {
    if (!user) {
      toast.error("You must be logged in to mark habits completed.");
      return;
    }
    const success = await markHabitCompleted(habit.id, user.id);
    if (success) {
      onHabitUpdate();
      // Toast message is now handled within markHabitCompleted for more specific feedback
    }
  };

  const handleDelete = async () => {
    const success = await deleteHabit(habit.id);
    if (success) {
      onHabitUpdate();
      toast.info(`Habit "${habit.name}" deleted.`);
    }
  };

  const firstUncompletedMilestoneIndex = habit.milestones.findIndex(m => !m.isCompleted);
  const currentMilestone = firstUncompletedMilestoneIndex !== -1 ? habit.milestones[firstUncompletedMilestoneIndex] : null;

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.last_completed_date === today;

  const progressValue = currentMilestone
    ? (currentMilestone.completedDays / currentMilestone.targetDays) * 100
    : 100; // If no current milestone, all are completed

  const isHabitCompletedAllMilestones = habit.milestones.every(m => m.isCompleted);

  // Determine if the habit's duration has ended (for duration-based habits)
  let durationEnded = false;
  if (habit.repeat_mode === 'duration' && habit.repeat_duration_value && habit.repeat_duration_unit) {
    const endDate = calculateEndDateForDisplay(habit.start_date, habit.repeat_duration_value, habit.repeat_duration_unit);
    durationEnded = isAfter(new Date(), endDate);
  }

  const displayIsActive = habit.is_active && !durationEnded; // Consider both DB status and calculated duration end

  return (
    <Card className={`w-full max-w-sm shadow-lg rounded-lg overflow-hidden ${displayIsActive ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 opacity-70'}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-xl font-semibold ${displayIsActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {habit.name}
        </CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your habit
                "{habit.name}" and all its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Current Streak: <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{habit.current_streak} days</span>
        </p>

        {habit.repeat_mode === 'forever' ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-2">
            <Repeat className="h-4 w-4 mr-1" /> Repeats: Forever
          </p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-2">
            <Clock className="h-4 w-4 mr-1" /> Repeats for: {habit.repeat_duration_value} {habit.repeat_duration_unit}
          </p>
        )}

        {displayIsActive ? (
          <>
            {currentMilestone ? (
              <div className="mb-4">
                <p className="text-md font-medium text-gray-700 dark:text-gray-300">
                  Current Goal: {currentMilestone.goal}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Completed {currentMilestone.completedDays} of {currentMilestone.targetDays} days
                </p>
                <Progress value={progressValue} className="w-full h-2 bg-gray-200 dark:bg-gray-700" />
              </div>
            ) : (
              <p className="text-md font-medium text-green-600 dark:text-green-400 mb-4">
                All milestones completed! Keep up the great work!
              </p>
            )}

            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleMarkCompleted}
                className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                disabled={isCompletedToday}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Complete {isCompletedToday && "(Today)"}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700">
                    <ListChecks className="mr-2 h-4 w-4" /> View Milestones
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <DialogHeader>
                    <DialogTitle>Milestones for "{habit.name}"</DialogTitle>
                    <DialogDescription>
                      Track your progress through each step of your habit.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <ul className="space-y-3">
                      {habit.milestones.map((milestone, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          {milestone.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-400 rounded-full flex-shrink-0"></div>
                          )}
                          <p className="text-base">
                            <span className={`font-medium ${milestone.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                              {milestone.goal}
                            </span>
                            {!milestone.isCompleted && (
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                ({milestone.completedDays} / {milestone.targetDays} days)
                              </span>
                            )}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">Habit Completed!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This habit has reached its duration limit.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Completed {habit.completion_count} cycle(s).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitCard;