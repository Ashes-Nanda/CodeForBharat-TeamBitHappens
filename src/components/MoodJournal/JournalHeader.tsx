import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Trophy, Calendar } from 'lucide-react';

const reflectionPrompts = [
  "What made you smile today?",
  "Describe a moment that challenged you today. How did you handle it?",
  "What are three things you're grateful for right now?",
  "How are you feeling about your current goals?",
  "What's something you learned about yourself today?",
  "Describe a small victory you had today.",
  "What's one thing you'd like to improve about today?",
  "How did you take care of yourself today?",
  "What's something that brought you peace today?",
  "What emotions did you experience today?",
  "What's one thing you're looking forward to?",
  "How did you show kindness to others today?",
  "What's a challenge you're currently facing?",
  "What's something that made you proud today?",
  "How did you practice self-care today?",
  "What's a moment you wish you could relive from today?",
  "What's something you're curious about right now?",
  "How did you handle stress today?",
  "What's a small step you took toward your goals today?",
  "What's something you'd like to let go of?"
];

const JournalHeader = () => {
  const [currentPrompt, setCurrentPrompt] = useState('');

  useEffect(() => {
    // Select a random prompt when component mounts
    const randomIndex = Math.floor(Math.random() * reflectionPrompts.length);
    setCurrentPrompt(reflectionPrompts[randomIndex]);
  }, []);

  return (
    <>
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">
          Your Mood Journal 📖
        </h2>
        <p className="text-white/80 text-lg">
          Express yourself and earn rewards! 🌟
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 bg-black/40 hover:bg-black/50 bg-gradient-to-br from-[#8B5CF6]/5 to-[#D946EF]/5 backdrop-blur-md border-white/20 transition-all duration-300 cursor-pointer">
          <div className="flex flex-col items-center space-y-2">
            <Trophy className="w-8 h-8 text-[#8B5CF6]" />
            <span className="text-lg font-semibold text-white">150 Points</span>
            <span className="text-sm text-white/70">Total Score</span>
          </div>
        </Card>

        <Card className="p-4 bg-black/40 hover:bg-black/50 bg-gradient-to-br from-[#8B5CF6]/5 to-[#D946EF]/5 backdrop-blur-md border-white/20 transition-all duration-300 cursor-pointer">
          <div className="flex flex-col items-center space-y-2">
            <Calendar className="w-8 h-8 text-[#D946EF]" />
            <span className="text-lg font-semibold text-white">7 Days</span>
            <span className="text-sm text-white/70">Current Streak</span>
          </div>
        </Card>

        <Card className="p-4 bg-black/40 hover:bg-black/50 bg-gradient-to-br from-[#8B5CF6]/5 to-[#D946EF]/5 backdrop-blur-md border-white/20 transition-all duration-300 cursor-pointer md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-white">Today's Prompt</h3>
              <p className="text-lg text-white/80">
                {currentPrompt}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default JournalHeader;