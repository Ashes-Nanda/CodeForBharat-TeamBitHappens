import { Gamepad2, Brain, Bot, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";

const features = [
  {
    icon: <Gamepad2 className="w-8 h-8 text-primary" />,
    title: "Satrang",
    description: "Let it out on the canvas. Your feelings, your way, no pressure"
  },
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: "Sahayak",
    description: "Your Empathetic Dost. I’m here to talk, listen, and stick around when you need someone most."
  },
  {
    icon: <Dumbbell className="w-8 h-8 text-primary" />,
    title: "Punching Bag",
    description: "Bad day? Hit me up,literally. I can take it so you don’t have to."
  },
  {
    icon: <Brain className="w-8 h-8 text-primary" />,
    title: "Mood Journal",
    description: "Say it out loud, scribble it down, or just feel, I’ll hold the space."
  }
];

const FeatureCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      setApi={setApi}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {features.map((feature, index) => (
          <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
            <CardSpotlight className="h-full glass-morphism">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 * index }}
                className="flex justify-center mb-4 relative z-10"
              >
                {feature.icon}
              </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-white relative z-10 gradient-text">
                {feature.title}
              </h3>
              <p className="text-white/70 relative z-10">{feature.description}</p>
            </CardSpotlight>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>

  );
};

export const Features = () => {
  return (
    <section id="features" className="relative py-20 bg-black/5 backdrop-blur-lg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center text-white mb-12"
        >
          Key Features
        </motion.h2>
        <div className="relative">
          <FeatureCarousel />
        </div>
      </div>
    </section>
  );
};