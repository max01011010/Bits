import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Award, Sparkles, Target } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { getHabits, Habit } from '@/lib/habit-store';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  checkCondition: (habits: Habit[]) => boolean;
}

const achievements: Achievement[] = [
  {
    id: 'habit-former',
    name: 'Habit Former',
    description: 'Complete your 1st Streak',
    icon: Award,
    checkCondition: (habits: Habit[]) => habits.some(h => h.current_streak > 0),
  },
  {
    id: 'power-of-habit',
    name: 'Power of Habit',
    description: 'Completed your 1st milestone',
    icon: Sparkles,
    checkCondition: (habits: Habit[]) => habits.some(h => h.milestones.some(m => m.isCompleted)),
  },
  {
    id: 'atomic-habit',
    name: 'Atomic Habit',
    description: 'Completed your 1st Goal (all milestones for a habit)',
    icon: Target,
    checkCondition: (habits: Habit[]) => habits.some(h => h.milestones.every(m => m.isCompleted)),
  },
];

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: isSessionLoading } = useSession();
  const [userHabits, setUserHabits] = useState<Habit[]>([]);
  const [isHabitsLoading, setIsHabitsLoading] = useState(true);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());

  const loadUserHabits = useCallback(async () => {
    if (user) {
      setIsHabitsLoading(true);
      const fetchedHabits = await getHabits(user.id);
      setUserHabits(fetchedHabits);
      setIsHabitsLoading(false);
    } else {
      setUserHabits([]);
      setIsHabitsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading) {
      loadUserHabits();
    }
  }, [isSessionLoading, loadUserHabits]);

  useEffect(() => {
    if (!isHabitsLoading && userHabits.length > 0) {
      const newUnlocked = new Set<string>();
      achievements.forEach(achievement => {
        if (achievement.checkCondition(userHabits)) {
          newUnlocked.add(achievement.id);
        }
      });
      setUnlockedAchievements(newUnlocked);
    } else if (!isHabitsLoading && userHabits.length === 0) {
      setUnlockedAchievements(new Set()); // Reset if no habits
    }
  }, [userHabits, isHabitsLoading]);

  if (isSessionLoading || isHabitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4 relative">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Habits
      </Button>

      <div className="text-center mt-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Achievements</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Milestones you've conquered on your journey!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.has(achievement.id);
          const IconComponent = achievement.icon;
          return (
            <Card
              key={achievement.id}
              className={`w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${
                isUnlocked ? 'border-green-500 dark:border-green-400' : 'border-gray-200 dark:border-gray-700 opacity-60 grayscale'
              }`}
            >
              <CardHeader className="flex flex-col items-center justify-center p-4">
                <div className={`p-3 rounded-full mb-3 ${isUnlocked ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">
                  {achievement.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-center">
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </CardDescription>
                {isUnlocked && (
                  <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">Unlocked!</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {achievements.length === 0 && (
        <p className="col-span-full text-center text-gray-500 dark:text-gray-400 text-lg mt-8">
          No achievements defined yet.
        </p>
      )}
    </div>
  );
};

export default AchievementsPage;