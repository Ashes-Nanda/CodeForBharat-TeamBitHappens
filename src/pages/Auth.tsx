import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from '@supabase/supabase-js';
import { WavyBackground } from "@/components/ui/wavy-background";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Check if user has a profile in Supabase
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (!profile) {
          navigate("/onboarding");
        } else {
          navigate("/");
        }
      }

      if (event === "SIGNED_OUT") {
        const { error } = await supabase.auth.getSession();
        if (error instanceof AuthError && error.message.includes("Invalid login credentials")) {
          toast({
            title: "Authentication Error",
            description: "You have not signed up yet. Please sign up first!",
            variant: "destructive",
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="bg-[#1A1A2E] flex flex-col relative overflow-x-hidden">
      <WavyBackground
        className="flex flex-col items-center justify-center w-full min-h-screen"
        colors={["#8B5CF6", "#D946EF", "#38bdf8"]}
        backgroundFill="#1A1A2E"
      >
        {/* Back button in upper left */}
        <div className="absolute top-6 left-6 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="bg-gradient-to-r from-[#8B5CF6]/80 to-[#D946EF]/80 text-white shadow-md rounded-full p-2 w-9 h-9 border-none hover:from-[#D946EF]/80 hover:to-[#8B5CF6]/80 transition-all duration-300"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        {/* Main content */}
        <div className="w-full max-w-md z-10 p-6 md:p-0">
          {/* Auth form container with glassmorphism effect */}
          <div className="backdrop-blur-xl bg-white/10 p-6 rounded-3xl shadow-3xl border border-white/10 relative overflow-hidden transition-all duration-500 transform hover:scale-[1.01]">
            {/* Gradient overlay for form background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
            {/* Auth UI */}
            <SupabaseAuth 
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(168, 85, 247)', // Purple
                      brandAccent: 'rgb(192, 132, 252)', // Light purple
                      brandButtonText: 'white',
                      defaultButtonBackground: 'linear-gradient(90deg, #8B5CF6 0%, #D946EF 100%)',
                      defaultButtonBackgroundHover: 'linear-gradient(90deg, #D946EF 0%, #8B5CF6 100%)',
                      defaultButtonBorder: 'transparent',
                      defaultButtonText: 'white',
                      dividerBackground: 'rgb(71, 85, 105)', // Slate
                      inputBackground: 'rgba(255, 255, 255, 0.05)',
                      inputBorder: 'rgb(71, 85, 105)',
                      inputBorderHover: 'rgb(192, 132, 252)', // Light purple
                      inputBorderFocus: 'rgb(168, 85, 247)', // Purple
                      inputText: 'white',
                      inputLabelText: 'rgb(203, 213, 225)', // Light slate
                      inputPlaceholder: 'rgb(148, 163, 184)', // Slate
                    },
                    space: {
                      inputPadding: '1.25rem',
                      buttonPadding: '1.25rem',
                    },
                    borderWidths: {
                      buttonBorderWidth: '0px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '1rem',
                      buttonBorderRadius: '1rem',
                    },
                    fonts: {
                      bodyFontFamily: `'Inter', sans-serif`,
                      buttonFontFamily: `'Inter', sans-serif`,
                      inputFontFamily: `'Inter', sans-serif`,
                      labelFontFamily: `'Inter', sans-serif`,
                    },
                  },
                },
                className: {
                  container: 'w-full space-y-6',
                  button: 'w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white shadow-lg border-none transition-all duration-300 hover:from-[#D946EF] hover:to-[#8B5CF6] font-semibold text-lg',
                  input: 'w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/20 focus:border-purple-500 transition-all duration-300 text-lg',
                  label: 'text-base font-medium text-gray-300 mb-2',
                  message: 'text-red-400 text-sm mt-3',
                  anchor: 'text-purple-400 hover:text-purple-300 transition-colors duration-200',
                },
              }}
              providers={["google"]}
              redirectTo="https://lovable.dev/projects/30918e7d-7794-40af-9d31-804d575a647f/dashboard"
              view="sign_in"
            />
          </div>
        </div>
      </WavyBackground>
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-8 h-8">
            <Loader />
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;