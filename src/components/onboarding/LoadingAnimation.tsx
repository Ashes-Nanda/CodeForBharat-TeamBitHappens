import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRef, useState, useEffect } from 'react';

const personalityMessages = [
  {
    main: "You're a Sunny Side Up ☀️ — warm vibes, but sometimes fried on the edges.",
    sub: "You shine, even on rough days."
  },
  {
    main: "You're a Midnight Mind 🌌 — deep thoughts, late nights, big feelings.",
    sub: "We love a little overthinking queen/king."
  },
  {
    main: "You're a Cloud Walker ☁️ — floating through the chaos, trying to make sense of it all.",
    sub: "Let's help you land softly."
  },
  {
    main: "You're a Chai in a Storm ☕⛈️ — comforting but stirred up lately.",
    sub: "Let's brew some calm together."
  },
  {
    main: "You're a Meme Philosopher 🤔😂 — joking through the pain, but feeling it all.",
    sub: "You're safe here to take the mask off."
  },
  {
    main: "You're a Low Battery Phone 🔋 — running on 5%, but still pushing through.",
    sub: "Let's plug in some peace."
  },
  {
    main: "You're a Bollywood Plot Twist 🎬 — unpredictable, emotional, iconic.",
    sub: "Main character energy — now let's get you some support too."
  },
  {
    main: "You're a Rainy Window 🪟🌧️ — quiet, reflective, and full of depth.",
    sub: "Let's clear the fog, one breath at a time."
  },
  {
    main: "You're an Open Tab Overload 💻 — doing too much, feeling too much.",
    sub: "Time to close a few tabs, emotionally."
  },
  {
    main: "You're a Mixed Tape 🌀 — highs, lows, and everything in between.",
    sub: "Let's help you hit play on healing."
  }
];

const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * personalityMessages.length);
  return randomIndex;
};

const LoadingAnimation = () => {
  const lottieRef = useRef<any>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(getRandomMessage());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(getRandomMessage());
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#1A1A2E] flex items-center justify-center z-50 w-screen h-screen"
    >
      <div className="text-center w-full h-full flex flex-col items-center justify-center">
        <div className="w-64 h-64 mx-auto">
          <DotLottieReact
            ref={lottieRef}
            src="https://lottie.host/7bc33c7c-0235-47d0-aaf8-52f5f5640391/pExtzm1rab.lottie"
            autoplay
            loop
            speed={0.5}
            onLoad={() => {
              if (lottieRef.current) {
                lottieRef.current.setSpeed(0.5);
              }
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-lg mx-auto px-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-2 text-white">
                {personalityMessages[currentMessageIndex].main}
              </h2>
              <p className="text-lg text-white/80 italic">
                {personalityMessages[currentMessageIndex].sub}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center space-x-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingAnimation; 