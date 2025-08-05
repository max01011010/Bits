import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Award, Sparkles, Target, Footprints, Star, CheckCircle2, Trophy, Medal, Ribbon, Gem, Crown, Feather, Zap, Flame, Leaf, Heart, Brain, Dumbbell, BookOpen, Clock, Mountain, Sun, Coffee, Pizza, Bike } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { getHabits, Habit } from '@/lib/habit-store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { differenceInMonths, parseISO } from 'date-fns';

// Map Lucide icon names (as returned by AI) to Lucide icon components
const LucideIcons: { [key: string]: React.ElementType } = {
  Award, Sparkles, Target, Footprints, Star, CheckCircle2, Trophy, Medal, Ribbon, Gem, Crown, Feather, Zap, Flame, Leaf, Heart, Brain, Dumbbell, BookOpen, Clock, Mountain, Sun, Coffee, Pizza, Bike
};

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  isUnlocked: boolean;
  trigger_condition?: string; // Optional for global achievements, but present for AI-generated
}

interface UserAchievementFromDB {
  id: string;
  user_id: string;
  habit_id: string | null;
  name: string;
  description: string;
  icon_name: string; // This now stores the exact Lucide icon component name
  is_unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
  trigger_condition: string | null; // Added trigger_condition
}

const globalAchievements: Omit<Achievement, 'isUnlocked'>[] = [
  {
    id: 'habit-former',
    name: 'Habit Former',
    description: 'Complete your 1st Streak',
    icon: LucideIcons['Trophy'] || Award,
    trigger_condition: 'Complete your 1st streak for any habit',
  },
  {
    id: 'power-of-habit',
    name: 'Power of Habit',
    description: 'Completed your 1st milestone',
    icon: LucideIcons['Sparkles'] || Sparkles,
    trigger_condition: 'Complete your 1st milestone for any habit',
  },
  {
    id: 'atomic-habit',
    name: 'Atomic Habit',
    description: 'Completed your 1st Goal (all milestones for a habit)',
    icon: LucideIcons['Target'] || Target,
    trigger_condition: 'Complete all milestones for any habit',
  },
  {
    id: 'repeat-champion',
    name: 'Repeat Champion',
    description: 'Started a habit again (completed its first cycle)',
    icon: LucideIcons['Repeat'] || Award,
    trigger_condition: 'Complete the first cycle of any habit',
  },
  {
    id: 'consistency-is-key',
    name: 'Consistency is Key',
    description: 'Completed a habit to its set repeat limit',
    icon: LucideIcons['CheckCircle2'] || Award,
    trigger_condition: 'Complete a duration-based habit',
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Completed a habit for 3 repeats',
    icon: LucideIcons['Medal'] || Award,
    trigger_condition: 'Complete 3 cycles of any habit',
  },
  {
    id: 'practitioner',
    name: 'Practitioner',
    description: 'Completed a habit for 6 repeats',
    icon: LucideIcons['Ribbon'] || Award,
    trigger_condition: 'Complete 6 cycles of any habit',
  },
  {
    id: 'creature-of-habit',
    name: 'Creature of Habit',
    description: 'Completed a habit set to repeat forever for 2 months',
    icon: LucideIcons['Leaf'] || Award,
    trigger_condition: 'Maintain a forever habit for 2 months',
  },
  {
    id: 'devotee',
    name: 'Devotee',
    description: 'Completed a habit set to repeat forever for 6 months',
    icon: LucideIcons['Crown'] || Award,
    trigger_condition: 'Maintain a forever habit for 6 months',
  },
];

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: isSessionLoading } = useSession();
  const [userHabits, setUserHabits] = useState<Habit[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievementFromDB[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [displayedAchievements, setDisplayedAchievements] = useState<Achievement[]>([]);

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      // Fetch habits
      const fetchedHabits = await getHabits(user.id);
      setUserHabits(fetchedHabits);

      // Fetch user-specific achievements
      const { data: fetchedUserAchievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (achievementsError) {
        console.error('Error fetching user achievements:', achievementsError);
        toast.error('Failed to load custom achievements.');
        setUserAchievements([]);
      } else {
        setUserAchievements(fetchedUserAchievements as UserAchievementFromDB[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data.');
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading) {
      loadData();
    }
  }, [isSessionLoading, loadData]);

  useEffect(() => {
    if (!isLoadingData && user) {
      const combinedAchievements: Achievement[] = [];
      const achievementsToInsert: Omit<UserAchievementFromDB, 'id' | 'created_at' | 'unlocked_at'>[] = [];

      // Create a set of global achievement names for quick lookup
      const globalAchievementNames = new Set(globalAchievements.map(ga => ga.name));

      // Evaluate global achievements and add them to combinedAchievements
      globalAchievements.forEach(achievement => {
        let isUnlocked = false;
        // Check if this global achievement is already in the user's saved achievements from DB
        const alreadyUnlockedInDb = userAchievements.some(ua => ua.name === achievement.name && ua.is_unlocked);

        if (alreadyUnlockedInDb) {
          isUnlocked = true;
        } else {
          // Evaluate unlocking conditions for global achievements
          if (achievement.id === 'habit-former') {
            isUnlocked = userHabits.some(h => h.current_streak > 0);
          } else if (achievement.id === 'power-of-habit') {
            isUnlocked = userHabits.some(h => h.milestones.some(m => m.isCompleted));
          } else if (achievement.id === 'atomic-habit') {
            isUnlocked = userHabits.some(h => h.milestones.every(m => m.isCompleted));
          } else if (achievement.id === 'repeat-champion') {
            isUnlocked = userHabits.some(h => h.completion_count >= 1);
          } else if (achievement.id === 'consistency-is-key') {
            isUnlocked = userHabits.some(h => h.repeat_mode === 'duration' && !h.is_active);
          } else if (achievement.id === 'committed') {
            isUnlocked = userHabits.some(h => h.completion_count >= 3);
          } else if (achievement.id === 'practitioner') {
            isUnlocked = userHabits.some(h => h.completion_count >= 6);
          } else if (achievement.id === 'creature-of-habit') {
            isUnlocked = userHabits.some(h =>
              h.repeat_mode === 'forever' &&
              differenceInMonths(new Date(), parseISO(h.start_date)) >= 2
            );
          } else if (achievement.id === 'devotee') {
            isUnlocked = userHabits.some(h =>
              h.repeat_mode === 'forever' &&
              differenceInMonths(new Date(), parseISO(h.start_date)) >= 6
            );
          }
        }

        combinedAchievements.push({ ...achievement, isUnlocked });

        // If newly unlocked (not in DB yet), add to batch for insertion
        if (isUnlocked && !alreadyUnlockedInDb) {
          achievementsToInsert.push({
            user_id: user.id,
            habit_id: null, // Universal achievement
            name: achievement.name,
            description: achievement.description,
            icon_name: achievement.icon.displayName || achievement.icon.name || 'Award',
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
            trigger_condition: achievement.trigger_condition || null,
          });
        }
      });

      // Add user-specific achievements (AI-generated) that are NOT global achievements
      userAchievements.forEach(userAch => {
        // Only add if it's not a global achievement (to avoid duplication)
        if (!globalAchievementNames.has(userAch.name)) {
          const IconComponent = LucideIcons[userAch.icon_name] || Award;
          combinedAchievements.push({
            id: userAch.id,
            name: userAch.name,
            description: userAch.description,
            icon: IconComponent,
            isUnlocked: userAch.is_unlocked,
            trigger_condition: userAch.trigger_condition || undefined,
          });
        }
      });

      setDisplayedAchievements(combinedAchievements);

      // Perform batch insertion if there are new achievements to unlock
      if (achievementsToInsert.length > 0) {
        const insertAchievements = async () => {
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert(achievementsToInsert);

          if (insertError) {
            console.error('Error inserting new universal achievements:', insertError);
            toast.error('Failed to save some new achievements.');
          } else {
            toast.success(`New achievement unlocked!`);
            loadData(); // Re-fetch data to update state with newly inserted achievements
          }
        };
        insertAchievements();
      }
    }
  }, [userHabits, userAchievements, isLoadingData, user, loadData]);

  if (isSessionLoading || isLoadingData) {
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
        {displayedAchievements.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 text-lg mt-8">
            No achievements defined yet. Add a habit to generate custom achievements!
          </p>
        ) : (
          displayedAchievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <Card
                key={achievement.id}
                className={`w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${
                  achievement.isUnlocked ? 'border-green-500 dark:border-green-400' : 'border-gray-200 dark:border-gray-700 opacity-60 grayscale'
                }`}
              >
                <CardHeader className="flex flex-col items-center justify-center p-4">
                  <div className={`p-3 rounded-full mb-3 ${achievement.isUnlocked ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
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
                  {achievement.isUnlocked && (
                    <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">Unlocked!</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;