import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export const CompanionGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Mental Health Companion</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#2A2A3E] p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold">Your Wellness Journey</h2>
            </div>
            <p className="text-gray-300">
              Based on your responses, we've created a personalized experience to support your mental well-being.
            </p>
          </div>

          <div className="bg-[#2A2A3E] p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold">Features Tailored for You</h2>
            </div>
            <p className="text-gray-300">
              We've selected features that align with your needs and preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 