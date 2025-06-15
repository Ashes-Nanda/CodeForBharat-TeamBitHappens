import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';
import { useEffect } from 'react';

export type EntryType = 'text' | 'drawing' | 'voice' | 'video';

export interface JournalEntry {
  id: string;
  type: EntryType;
  content: string;
  created_at: string;  // Changed from 'date' to 'created_at' to match DB schema
  mood: string;
  title?: string;
  description?: string;
  privacy?: 'public' | 'private';
}

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'created_at'>) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
      if (error) {
        toast({
          title: 'Failed to fetch mood entries',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      if (data) {
        setEntries(
          data.map((entry) => ({
            id: entry.id,
            type: 'text', // Only mood entries for now
            content: entry.reflection || '',
            created_at: entry.created_at,
            mood: entry.mood,
            title: undefined,
            description: undefined,
            privacy: 'private',
          }))
        );
      }
    };
    fetchEntries();
  }, []);

  const addEntry = async (entry: Omit<JournalEntry, 'id' | 'created_at'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const insertObj: TablesInsert<'mood_entries'> = {
        user_id: session.user.id,
        date: new Date().toISOString().slice(0, 10),
        mood: entry.mood,
        reflection: entry.content,
      };
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([insertObj])
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        setEntries((prev) => [
          {
            id: data[0].id,
            type: 'text',
            content: data[0].reflection || '',
            created_at: data[0].created_at,
            mood: data[0].mood,
            title: undefined,
            description: undefined,
            privacy: 'private',
          },
          ...prev,
        ]);
      }
      toast({
        title: 'Entry saved successfully! 🎉',
        description: 'Your journal entry has been added to your profile.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to save entry',
        description: error.message || 'Please try again. If the problem persists, check your connection.',
        variant: 'destructive',
      });
    }
  };

  const deleteEntry = (id: string) => {
    try {
      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been removed.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete entry",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const updateEntry = (id: string, updates: Partial<JournalEntry>) => {
    try {
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      ));
      toast({
        title: "Entry updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update entry",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <JournalContext.Provider value={{ entries, addEntry, deleteEntry, updateEntry }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};