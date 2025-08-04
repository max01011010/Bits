import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { addHabit, Milestone } from '@/lib/habit-store';
import { toast } from 'sonner';

const AddHabitPage: React.FC = () => {
  const [endGoal, setEndGoal] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Milestone[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const handleGenerateSuggestions = () => {
    if (!endGoal.trim()) {
      toast.error("Please enter your end goal.");
      return;
    }

    // Simulate AI response for incremental steps
    const simulatedMilestones: Milestone[] = [];
    const goalLower = endGoal.toLowerCase();

    if (goalLower.includes('walk') && goalLower.includes('steps')) {
      simulatedMilestones.push(
        { goal: "Start with 1000 steps a day", targetDays: 3, completedDays: 0, isCompleted: false },
        { goal: "Increase to 3000 steps a day", targetDays: 5, completedDays: 0, isCompleted: false },
        { goal: "Reach 5000 steps a day", targetDays: 7, completedDays: 0, isCompleted: false },
        { goal: `Achieve your end goal of ${endGoal}`, targetDays: 10, completedDays: 0, isCompleted: false }
      );
    } else if (goalLower.includes('read') && goalLower.includes('book')) {
      simulatedMilestones.push(
        { goal: "Read 10 pages a day", targetDays: 5, completedDays: 0, isCompleted: false },
        { goal: "Read 20 pages a day", targetDays: 7, completedDays: 0, isCompleted: false },
        { goal: `Finish your book: ${endGoal}`, targetDays: 14, completedDays: 0, isCompleted: false }
      );
    } else if (goalLower.includes('exercise') || goalLower.includes('workout')) {
      simulatedMilestones.push(
        { goal: "Exercise 15 minutes, 3 times a week", targetDays: 3, completedDays: 0, isCompleted: false },
        { goal: "Exercise 30 minutes, 4 times a week", targetDays: 4, completedDays: 0, isCompleted: false },
        { goal: `Achieve your fitness goal: ${endGoal}`, targetDays: 7, completedDays: 0, isCompleted: false }
      );
    } else {
      simulatedMilestones.push(
        { goal: `Start with a small step towards: ${endGoal}`, targetDays: 3, completedDays: 0, isCompleted: false },
        { goal: `Continue building momentum for: ${endGoal}`, targetDays: 5, completedDays: 0, isCompleted: false },
        { goal: `Work towards your ultimate goal: ${endGoal}`, targetDays: 7, completedDays: 0, isCompleted: false }
      );
    }

    setAiSuggestions(simulatedMilestones);
    setShowSuggestions(true);
    toast.success("AI suggestions generated!");
  };

  const handleAddHabit = () => {
    if (!endGoal.trim() || aiSuggestions.length === 0) {
      toast.error("Please generate AI suggestions first.");
      return;
    }
    addHabit(endGoal, aiSuggestions);
    toast.success(`Habit "${endGoal}" added successfully!`);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">Define Your Goal</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Tell our AI your end goal, and we'll help you break it down into achievable steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="endGoal" className="text-lg font-medium text-gray-800 dark:text-gray-200">What is your end goal?</Label>
              <Textarea
                id="endGoal"
                placeholder="e.g., Walk 7000 steps a day, Read 1 book a month, Exercise 5 times a week"
                value={endGoal}
                onChange={(e) => setEndGoal(e.target.value)}
                className="min-h-[100px] text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <Button
              onClick={handleGenerateSuggestions}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Generate AI Suggestions
            </Button>

            {showSuggestions && (
              <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Suggested Milestones:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  {aiSuggestions.map((milestone, index) => (
                    <li key={index}>
                      <span className="font-medium">{milestone.goal}</span> (Target: {milestone.targetDays} days)
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <strong className="text-red-500">Note:</strong> This is a simulated AI response. For real AI capabilities, you would integrate a backend service (e.g., a serverless function on Supabase) to call an actual AI API.
                </p>
                <Button
                  onClick={handleAddHabit}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Add Habit
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddHabitPage;