import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { MessageSquare, Mic, Video } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

import DrawingsTab from './DrawingsTab';
import ThoughtsTab from './ThoughtsTab';
import VoiceTab from './VoiceTab';
import VideoTab from './VideoTab';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import ProfileStats from './ProfileStats';
import PrivacySettings from './PrivacySettings';

const ProfilePage = () => {
  const { toast } = useToast();

  const [privacySettings, setPrivacySettings] = useState({
    isPublic: false,
    shareMoodHistory: false,
    showActivityStatus: true,
  });

  const [userData, setUserData] = useState({
    name: '',
    joinDate: '',
    avatarUrl: '',
    bio: '',
    email: '',
    dateOfBirth: '',
    gender: '',
  });

  const userStats = {
    totalEntries: 42,
    moodScore: 85,
    streakDays: 7,
  };

  useEffect(() => {
    // Temporarily use mock data
    setUserData({
      name: 'User',
      joinDate: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
      avatarUrl: '',
      bio: 'Welcome to your profile!',
      email: 'user@example.com',
      dateOfBirth: '',
      gender: '',
    });

    toast({
      title: "Profile loaded",
      description: "Your profile data has been loaded successfully.",
    });
  }, []);

  const handleSettingChange = async (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <ProfileHeader />

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileCard user={userData} />
        <ProfileStats stats={userStats} />
      </div>

      {/* Privacy Settings */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 overflow-hidden">
        <PrivacySettings
          settings={privacySettings}
          onSettingChange={handleSettingChange}
        />
      </Card>

      {/* Content Tabs */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
        <Tabs defaultValue="drawings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-4 p-4">
            <TabsTrigger 
              value="drawings" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 truncate"
            >
              <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Drawings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="thoughts"
              className="data-[state=active]:bg-duo-blue data-[state=active]:text-white transition-all duration-300 truncate"
            >
              <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Thoughts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="voice"
              className="data-[state=active]:bg-duo-green data-[state=active]:text-white transition-all duration-300 truncate"
            >
              <Mic className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Voice</span>
            </TabsTrigger>
            <TabsTrigger 
              value="video"
              className="data-[state=active]:bg-duo-orange data-[state=active]:text-white transition-all duration-300 truncate"
            >
              <Video className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Video</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4 overflow-hidden">
            <TabsContent value="drawings" className="overflow-hidden">
              <DrawingsTab />
            </TabsContent>
            <TabsContent value="thoughts" className="overflow-hidden">
              <ThoughtsTab />
            </TabsContent>
            <TabsContent value="voice" className="overflow-hidden">
              <VoiceTab />
            </TabsContent>
            <TabsContent value="video" className="overflow-hidden">
              <VideoTab />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfilePage;