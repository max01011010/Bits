import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash2 } from 'lucide-react';
import { Habit, markHabitCompleted, deleteHabit, updateHabit } from '@/lib/habit-store';
import { toast } from 'sonner';

interface HabitCardProps {
  habit: Habit;
  onHabitUpdate: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onHabitUpdate }) => {
  const handleMarkCompleted = () => {
    markHabitCompleted(habit.id);
    onHabitUpdate();
    toast.success(`Habit "${habit.name}" marked as completed for today!`);
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    onHabitUpdate();
    toast.info(`Habit "${habit.name}" deleted.`);
  };

  const currentMilestone = habit.milestones.find(m => !m.isCompleted);
  const nextMilestoneIndex = habit.milestones.findIndex(m => !m.isCompleted);

  React.useEffect(() => {
    if (currentMilestone && currentMilestone.completedDays >= currentMilestone.targetDays) {
      const updatedMilestones = habit.milestones.map((m, index) =>
        index === nextMilestoneIndex ? { ...m, isCompleted: true } : m
      );
      updateHabit({ ...habit, milestones: updatedMilestones });
      onHabitUpdate();
      toast.success(`Milestone "${currentMilestone.goal}" completed for "${habit.name}"!`);
    }
  }, [currentMilestone, habit, nextMilestoneIndex, onHabitUpdate]);

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.lastCompletedDate === today;

  return (
    <Card className="w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">{habit.name}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Current Streak: <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{habit.currentStreak} days</span>
        </p>
        {currentMilestone ? (
          <div className="mb-4">
            <p className="text-md font-medium text-gray-700 dark:text-gray-300">
              Current Goal: {currentMilestone.goal}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Completed {currentMilestone.completedDays} of {currentMilestone.targetDays} days
            </p>
          </div>
        ) : (
          <p className="text-md font-medium text-green-600 dark:text-green-400 mb-4">
            All milestones completed! Keep up the great work!
          </p>
        )}
        <Button
          onClick={handleMarkCompleted}
          className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
          disabled={isCompletedToday}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Completed {isCompletedToday && "(Today)"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HabitCard;