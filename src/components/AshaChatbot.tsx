import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isCrisisMessage, handleCrisisSituation } from '@/utils/crisisResponse';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type EmotionState = 'happy' | 'angry' | 'low' | 'stuck' | 'need_visualization' | 'track_emotions' | 'set_goals' | 'mental_health_check' | 'expert_guidance';
type Feature = 'Emoji Garden' | 'Stress Relief Bag' | 'Memory Match' | 'Mindful Maze' | 'Satrang' | 'Mood Calendar' | 'Goal Setter' | 'Mental Health Quiz' | 'Resource Library';

interface UserPreferences {
  answers: Record<string, string[]>;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  timestamp: number;
}

interface AshaChatbotProps {
  initialOpen?: boolean;
}

const getRandomMessage = (messages: string[]): string => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

const getInitialGreetings = (botName: string): string[] => [
  `Hey there! I'm ${botName}, your mental health companion. How are you feeling today?`,
  `Hi! I'm ${botName}, here to support your mental well-being. What's on your mind?`,
  `Hello! ${botName} here, ready to chat about your mental health journey. How are you doing?`,
  `Welcome! I'm ${botName}, your friendly mental health companion. How's your day going?`,
  `Hey! ${botName} here, excited to support your mental wellness. How are you feeling?`
];

const getCustomPrompt = (botName: string): string => `
You are ${botName}, a friendly and empathetic mental health companion. Your responses should be:
1. Warm and supportive, using casual, friendly language.
2. Focused on mental health and emotional well-being.
3. Non-judgmental and understanding.
4. Encouraging but not pushy.
5. Very short, concise, and to the point (no more than 2-3 sentences).
6. Culturally sensitive and inclusive.
7. Professional while maintaining a casual tone.
8. Primarily focused on suggesting features of the app based on the mood detected in the user\'s input.
9. Mindful of crisis situations, and if a crisis is detected, ONLY state the crisis response message (do not suggest features).
10. Personalized to the user\'s needs.

Here are the available features:
- Emoji Garden: for expressing emotions visually.
- Stress Relief Bag: for quick stress reduction techniques.
- Memory Match: a fun game to improve focus.
- Mindful Maze: for guided mindfulness exercises.
- Satrang: for color therapy and relaxation.
- Mood Calendar: for tracking and visualizing mood patterns.
- Goal Setter: for setting and tracking personal goals.
- Mental Health Quiz: for self-assessment and insights.
- Resource Library: for information and external support.

If the user expresses a mood, suggest one or two highly relevant features from the list above. Keep the suggestions natural and integrated into the conversation. For example, if a user says they are \"stressed\", you might suggest \"Stress Relief Bag\".

Remember to:
- Use the user\'s name when available.
- Show empathy and understanding.
- Keep responses focused and relevant.
- Suggest appropriate features based on the context.
- Maintain a supportive and encouraging tone.
`;

const getFeatureRecommendations = (preferences: UserPreferences): string[] => {
  const featureScores: Record<Feature, number> = {
    'Emoji Garden': 0,
    'Stress Relief Bag': 0,
    'Memory Match': 0,
    'Mindful Maze': 0,
    'Satrang': 0,
    'Mood Calendar': 0,
    'Goal Setter': 0,
    'Mental Health Quiz': 0,
    'Resource Library': 0
  };

  // Map user answers to features
  const mappedFeatures: Record<EmotionState, Feature[]> = {
    'happy': ['Emoji Garden', 'Memory Match', 'Satrang'],
    'angry': ['Stress Relief Bag', 'Mindful Maze'],
    'low': ['Mood Calendar', 'Mental Health Quiz', 'Resource Library'],
    'stuck': ['Mindful Maze', 'Goal Setter', 'Resource Library'],
    'need_visualization': ['Satrang', 'Emoji Garden'],
    'track_emotions': ['Mood Calendar', 'Mental Health Quiz'],
    'set_goals': ['Goal Setter', 'Resource Library'],
    'mental_health_check': ['Mental Health Quiz', 'Resource Library'],
    'expert_guidance': ['Resource Library', 'Mental Health Quiz']
  };

  // Calculate scores based on user answers
  Object.entries(preferences.answers).forEach(([_, answers]) => {
    answers.forEach(answer => {
      const features = mappedFeatures[answer as EmotionState] || [];
      features.forEach(feature => {
        featureScores[feature] += 1;
      });
    });
  });

  // Sort features by score and get top 3
  const sortedFeatures = Object.entries(featureScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([feature]) => feature);

  // Generate random recommendation messages
  const recommendationMessages = [
    "I think you might really enjoy",
    "Have you tried",
    "You might find",
    "I'd love to see you explore",
    "Consider checking out"
  ];

  return sortedFeatures.map(feature => {
    const randomMessage = getRandomMessage(recommendationMessages);
    return `${randomMessage} ${feature} - it's perfect for your needs!`;
  });
};

const AshaChatbot: React.FC<AshaChatbotProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownRecommendations, setHasShownRecommendations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const companionName = localStorage.getItem('companionName') || 'Asha';

  useEffect(() => {
    if (isOpen && !hasShownRecommendations) {
      const userPreferences = localStorage.getItem('userPreferences');
      
      let initialBotMessage = '';
      const greeting = getRandomMessage(getInitialGreetings(companionName));

      if (userPreferences) {
        const preferences = JSON.parse(userPreferences) as UserPreferences;
        const recommendations = getFeatureRecommendations(preferences);
        
        initialBotMessage = `${greeting}\n\nBased on your responses, I think these features might be helpful for you:\n- ${recommendations.join('\n- ')}`;
      } else {
        initialBotMessage = greeting;
      }

      setMessages([
        {
          id: Date.now(),
          text: initialBotMessage,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
      setHasShownRecommendations(true);
    }
  }, [isOpen, hasShownRecommendations, companionName]);

  // Reset hasShownRecommendations when isOpen changes to false
  useEffect(() => {
    if (!isOpen) {
      setHasShownRecommendations(false);
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (isCrisisMessage(input)) {
      try {
        const crisisResponse = await handleCrisisSituation(input);
        const botMessage: Message = {
          id: Date.now(),
          text: typeof crisisResponse === 'string' ? crisisResponse : (crisisResponse && typeof crisisResponse === 'object' && 'message' in crisisResponse ? crisisResponse.message : 'I am unable to provide a crisis response at this moment. Please reach out to emergency services.'),
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: Date.now(),
          text: 'I encountered an error trying to provide a crisis response. Please reach out to emergency services.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      setIsLoading(false);
      return;
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { maxOutputTokens: 100 }
      });
      const prompt = getCustomPrompt(companionName);
      const result = await model.generateContent(prompt + '\n\nUser: ' + input);
      const response = result.response.text();
      
      const botMessage: Message = {
        id: Date.now(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] p-4 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]"
                onClick={() => setIsOpen(false)}
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[100] p-4"
            >
                <div className="w-full max-w-lg bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
                {/* Header */}
                <div className="flex-shrink-0 flex items-center gap-2 p-4 border-b border-white/20 bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bot className="w-8 h-8 text-[#D946EF]" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{companionName}</h3>
                      <p className="text-xs text-white/60">Your Mental Health Companion</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto text-white/60 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                    "flex gap-3 max-w-[80%]",
                    message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    {message.sender === 'bot' && (
                    <Bot className="w-8 h-8 text-[#D946EF] flex-shrink-0" />
                    )}
                    <div
                    className={cn(
                      "rounded-2xl p-3",
                      message.sender === 'user'
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white"
                      : "bg-white/10 text-white"
                    )}
                    >
                        {message.text}
                    </div>
                  </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 max-w-[80%]">
                      <Bot className="w-8 h-8 text-[#D946EF]" />
                      <div className="bg-white/10 rounded-2xl p-3 text-white">
                        <div className="flex gap-1">
                          <span className="animate-bounce">●</span>
                          <span className="animate-bounce delay-100">●</span>
                          <span className="animate-bounce delay-200">●</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 mt-auto">
                  <form onSubmit={handleSend} className="p-4 border-t border-white/20 bg-black/20">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                    <Button 
                      type="submit"
                      size="icon"
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white hover:opacity-90"
                        disabled={!input.trim() || isLoading}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    </div>
                    </form>
                  </div>
                  </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AshaChatbot; 