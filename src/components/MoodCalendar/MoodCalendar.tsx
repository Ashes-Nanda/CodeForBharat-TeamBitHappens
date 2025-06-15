import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, differenceInHours } from 'date-fns';
import MoodSelector from './MoodSelector';
import MoodGraph from './MoodGraph';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

interface MoodEntry {
  date: Date;
  mood: string;
  reflection: string;
}

const MOOD_COLORS = {
  '😊': 'bg-duo-green/20 hover:bg-duo-green/30',
  '😢': 'bg-duo-blue/20 hover:bg-duo-blue/30',
  '😡': 'bg-duo-red/20 hover:bg-duo-red/30',
  '😴': 'bg-duo-purple/20 hover:bg-duo-purple/30',
  '😌': 'bg-emerald-400/20 hover:bg-emerald-400/30',
  '🤔': 'bg-indigo-400/20 hover:bg-indigo-400/30',
  '😰': 'bg-duo-orange/20 hover:bg-duo-orange/30',
  '🥳': 'bg-pink-400/20 hover:bg-pink-400/30'
};

const MoodCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [graphView, setGraphView] = useState<'day' | 'week' | 'month'>('day');
  const [moodEntries, setMoodEntries] = useState<any[]>([]);
  const { toast } = useToast();

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Fetch moods for the current user and month
  useEffect(() => {
    const fetchMoods = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) {
        toast({
          title: 'Failed to fetch moods',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      setMoodEntries(data || []);
    };
    fetchMoods();
  }, [currentDate]);

  // Check for 2-hour interval reminder
  useEffect(() => {
    const checkMoodInterval = () => {
      const lastEntry = moodEntries
        .filter(entry => entry.mood)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      if (!lastEntry) {
        showMoodReminder();
        return;
      }

      const hoursSinceLastEntry = differenceInHours(
        new Date(),
        new Date(lastEntry.created_at)
      );

      if (hoursSinceLastEntry >= 2) {
        showMoodReminder();
      }
    };

    const showMoodReminder = () => {
      toast({
        title: "Psst... need to vent?",
        description: "Sahayak's here to listen.. No judgement, just vibes. Go say hi 👋",
        duration: 15000,
      });
    };

    // Check immediately and then every minute
    checkMoodInterval();
    const interval = setInterval(checkMoodInterval, 60000);

    return () => clearInterval(interval);
  }, [moodEntries, toast]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getMoodForDate = (date: Date) => {
    // Only show moods for the current user (already filtered in fetch)
    const moods = moodEntries.filter(entry => isSameDay(new Date(entry.date), date));
    if (moods.length === 0) return null;
    const latest = moods.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b);
    return latest;
  };

  const handleDateClick = (date: Date) => {
    if (!isToday(date)) {
      toast({ title: 'Please log your mood for today.' });
      return;
    }
    // Always allow logging for today, even if a mood exists
    setSelectedDate(date);
  };

  const handleSaveMood = async (date: Date, mood: string, reflection: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }
    const insertObj: TablesInsert<'mood_entries'> = {
      user_id: session.user.id,
      date: format(date, 'yyyy-MM-dd'),
      mood: mood,
      reflection: reflection,
    };
    const { data, error } = await supabase
      .from('mood_entries')
      .insert([insertObj])
      .select();
    if (error) {
      toast({ title: 'Failed to save mood', description: error.message, variant: 'destructive' });
      return;
    }
    if (data && data.length > 0) {
      setMoodEntries(prev => [...prev, data[0]]);
    }
    toast({ title: 'Mood logged successfully! 🎉', description: 'Your reflection has been saved.' });
    setSelectedDate(null);
  };

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <motion.div
        className="rounded-xl p-8 w-full h-full flex flex-col"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of card */}
          <motion.div
            className="absolute w-full h-full"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="space-y-6 w-full h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-8 h-8 text-[#D946EF]" />
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
                    Mood Calendar
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="hover:bg-black/30 text-white transition-all duration-300"
                >
                  <BarChart2 className="h-5 w-5 mr-2" />
                  Show Analysis
                </Button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={handlePreviousMonth}
                    aria-label="Previous month"
                    className="hover:bg-black/30 text-white transition-all duration-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="hover:bg-black/30 text-white transition-all duration-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                
                <Button
                  variant="ghost"
                  onClick={handleToday}
                  className="hover:bg-black/30 text-white gap-2 transition-all duration-300"
                >
                  <CalendarDays className="h-4 w-4" />
                  Today
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="font-medium text-white/60 p-2 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDate.toISOString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-7 gap-2"
                >
                  {daysInMonth.map((date) => {
                    const entry = getMoodForDate(date);
                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const mood = entry?.mood;
                    const moodColor = mood ? MOOD_COLORS[mood as keyof typeof MOOD_COLORS] : '';
                    
                    return (
                      <TooltipProvider key={date.toISOString()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDateClick(date)}
                              className={cn(
                                "aspect-square p-2 rounded-lg relative",
                                "transition-all duration-200",
                                isToday(date) ? "ring-2 ring-white/20" : "",
                                !isCurrentMonth && "opacity-30",
                                moodColor || "hover:bg-white/10",
                                "focus:outline-none focus:ring-2 focus:ring-white/20",
                              )}
                            >
                              <span className={cn(
                                "absolute top-1 left-1 text-xs font-medium",
                                isToday(date) ? "text-white" : "text-white/80"
                              )}>
                                {format(date, 'd')}
                              </span>
                              {entry ? (
                                <span className="absolute bottom-1 right-1 text-xl">
                                  {entry.mood}
                                </span>
                              ) : (
                                isCurrentMonth && (
                                  <Plus className="absolute bottom-1 right-1 w-4 h-4 text-white/40" />
                                )
                              )}
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {entry ? (
                              <div className="text-sm">
                                <div className="font-medium">{format(date, 'PPPP')}</div>
                                <div className="mt-1">Mood: {entry.mood}</div>
                              </div>
                            ) : (
                              <div className="text-sm">
                                <div className="font-medium">{format(date, 'PPPP')}</div>
                                <div className="mt-1">No mood logged</div>
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Back of card */}
          <motion.div
            className="absolute w-full h-full"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="space-y-6 w-full h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-8 h-8 text-[#D946EF]" />
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
                    Mood Analysis
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="hover:bg-black/30 text-white transition-all duration-300"
                >
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Show Calendar
                </Button>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <Button
                  variant={graphView === 'day' ? 'default' : 'ghost'}
                  onClick={() => setGraphView('day')}
                  className="hover:bg-black/30 text-white transition-all duration-300"
                >
                  Day
                </Button>
                <Button
                  variant={graphView === 'week' ? 'default' : 'ghost'}
                  onClick={() => setGraphView('week')}
                  className="hover:bg-black/30 text-white transition-all duration-300"
                >
                  Week
                </Button>
                <Button
                  variant={graphView === 'month' ? 'default' : 'ghost'}
                  onClick={() => setGraphView('month')}
                  className="hover:bg-black/30 text-white transition-all duration-300"
                >
                  Month
                </Button>
              </div>
              <MoodGraph entries={moodEntries} view={graphView} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedDate && (
          <MoodSelector 
            date={selectedDate} 
            onClose={() => setSelectedDate(null)}
            onSave={handleSaveMood}
          />
        )}

        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div 
              className="backdrop-blur-md bg-black/40 rounded-xl p-8 max-w-md w-full space-y-4 border border-white/20 hover:border-[#8B5CF6]/50 transition-all duration-300"
              onClick={e => e.stopPropagation()}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <p className="text-lg font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
                  {format(selectedEntry.date, 'PPPP')}
                </p>
                <span className="text-4xl block my-4">
                  {selectedEntry.mood}
                </span>
              </div>
              <p className="text-white/80">
                {selectedEntry.reflection}
              </p>
              <div className="flex justify-end">
                <Button 
                  variant="ghost"
                  onClick={() => setSelectedEntry(null)}
                  className="text-white hover:bg-black/30 transition-all duration-300"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodCalendar;