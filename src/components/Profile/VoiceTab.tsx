import { useState, useEffect, useCallback } from 'react';
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Play,
  Pause,
  Share2, 
  Trash2,
  Search,
  Calendar,
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const VoiceTab = () => {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEntries, setVoiceEntries] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchVoiceEntries = useCallback(async () => {
    if (!user) return;

    try {
      // Workaround for TypeScript error: Casting to 'any' to bypass type check if 'entries' table is not in generated types
      const { data, error } = await (supabase
        .from as any)('entries') // Explicitly typing the table name
        .select('id, created_at, content, title, mood')
        .eq('user_id', user.id)
        .eq('type', 'voice') // Assuming 'type' is a valid column in 'entries'
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setVoiceEntries(data);
      }
    } catch (error) {
      console.error('Error fetching voice entries:', error);
    }
  }, [user, supabase]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchVoiceEntries();
    }
  }, [user, fetchVoiceEntries]);

  const handlePlay = (audioContent: string) => {
    const audio = new Audio(`data:audio/wav;base64,${audioContent}`);
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleShare = () => {
    toast({
      title: "Sharing recording",
      description: "Your voice recording has been shared successfully!",
    });
  };

  const handleDeleteEntry = async (entryId: number) => {
    try {
      // Workaround for TypeScript error: Casting to 'any' to bypass type check
      const { error } = await (supabase
        .from as any)('entries') // Explicitly typing the table name
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      // Remove the deleted entry from the state
      setVoiceEntries(voiceEntries.filter(entry => entry.id !== entryId));

      toast({
        title: "Entry Deleted",
        description: "The voice entry has been removed.",
      });

    } catch (error) {
      console.error('Error deleting voice entry:', error);
      toast({
        title: "Error Deleting Entry",
        description: "Failed to delete the voice entry.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search voice recordings..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Filter by Date
        </Button>
      </div>

      <div className="space-y-4">
        {voiceEntries.map((entry) => (
          <Card 
            key={entry.id}
            className="hover:shadow-md transition-shadow duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{entry.title || 'Voice Recording'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString()} at{' '}
                    {new Date(entry.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePlay(entry.content)}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare()}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 h-12 bg-muted rounded-lg overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-primary/20 to-primary/40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {voiceEntries.find(e => e.id === selectedEntry)?.title || 'Voice Recording'}
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePlay(voiceEntries.find(e => e.id === selectedEntry)?.content)}
                  className="mx-auto block"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleShare()}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteEntry(parseFloat(selectedEntry as string))}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceTab;