import React, { useState, useEffect, useCallback } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHabits, Habit } from '@/lib/habit-store';
import HabitCard from '@/components/HabitCard';

const Index = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);

  const loadHabits = useCallback(() => {
    setHabits(getHabits());
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4 relative">
      <div className="absolute top-4 right-4">
        <Button
          size="icon"
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          onClick={() => navigate('/add-habit')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <div className="text-center mt-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Habits</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Track your progress and build new routines!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {habits.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 text-lg">
            No habits yet. Click the '+' button to add your first habit!
          </p>
        ) : (
          habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} onHabitUpdate={loadHabits} />
          ))
        )}
      </div>

      <div className="mt-auto py-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;