import { Header } from "@/components/home/Header";
import { Features } from "@/components/home/Features";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .single();
        setHasProfile(!!profile);
      }
    })();
  }, []);

  const handleStartJourney = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    if (hasProfile) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  const handleJoinNow = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    if (hasProfile) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col relative overflow-x-hidden font-['Comic Sans MS']">
      <Header />
      <main className="flex-grow">
        <WavyBackground 
          className="max-w-4xl mx-auto py-32 mt-20"
          colors={["#8B5CF6", "#D946EF", "#38bdf8"]}
          backgroundFill="#1A1A2E"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 text-center animate-fade-in font-['Comic Sans MS']">
            Life thodi messy hai? Thik hai, baat kar lete hain.
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto text-center animate-fade-in delay-100 font-['Comic Sans MS']">
            The space where your emotions find a voice, your safety is prioritized, and support is always within reach.
          </p>
          <div className="flex justify-center animate-fade-in delay-200">
            <Button
              onClick={handleStartJourney}
              className="bg-white/10 backdrop-blur-md border border-white/20 
                hover:bg-white/20 transition-all duration-300 text-white
                px-8 py-6 text-lg rounded-full"
            >
              {hasProfile ? "Continue Your Journey" : "Start your Journey"}
            </Button>
          </div>
        </WavyBackground>

        <Features />
        <StaggerTestimonials />

        <section className="py-20 bg-gradient-to-r from-primary/20 to-accent/20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              We have got you, start to soul
            </h2>
            <Button
              onClick={handleJoinNow}
              className="bg-white/10 backdrop-blur-md border border-white/20 
                hover:bg-white/20 transition-all duration-300 text-white
                animate-float"
            >
              {hasProfile ? "Continue Your Journey" : "Join Now for Free"}
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-black/20 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg text-white mb-4 font-['Comic Sans MS']">Zenith</h3>
              <p className="text-white/60 font-['Comic Sans MS']">
                Your journey to emotional well-being starts here.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["About Us", "Features", "Blog", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/60 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/60 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Newsletter</h4>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 
                                hover:bg-white/20 transition-all duration-300 text-white">
                  Subscribe
                  <Mail className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
            <p className="font-['Comic Sans MS']">&copy; {new Date().getFullYear()} Zenith. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;