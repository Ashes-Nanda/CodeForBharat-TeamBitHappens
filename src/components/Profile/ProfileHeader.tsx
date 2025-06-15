import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProfileHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <Button
        onClick={handleLogout}
        className="gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#F59E42] text-white shadow-lg hover:opacity-90 transition-all duration-300 border-0"
        style={{ backgroundSize: '200% 200%' }}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
};

export default ProfileHeader;
