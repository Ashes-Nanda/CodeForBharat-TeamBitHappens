import { useJournal } from '@/contexts/JournalContext';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Smile } from 'lucide-react';

const MoodJournalEntries = () => {
  const { entries } = useJournal();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-duo-purple">Mood Journal Entries</h3>
      {entries.length === 0 ? (
        <div className="text-gray-400">No mood journal entries yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-6 bg-white/10 border-white/20 rounded-xl shadow-md hover:border-duo-purple/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Smile className="w-5 h-5 text-duo-purple" />
                <span className="text-sm text-gray-300">{format(new Date(entry.created_at), 'PPP')}</span>
              </div>
              <div className="mb-2 text-white font-medium">{entry.content}</div>
              {entry.mood && (
                <div className="inline-block px-3 py-1 rounded-full text-xs bg-duo-purple/20 text-duo-purple font-semibold">
                  Mood: {entry.mood}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodJournalEntries; 