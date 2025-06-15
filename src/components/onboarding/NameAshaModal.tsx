import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LoadingAnimation from './LoadingAnimation';

interface NameAshaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedNames = [
  { name: 'Riya', emoji: '👋' },
  { name: 'Bro', emoji: '🤜' },
  { name: 'ZenBot', emoji: '🤖' }
];

export const NameAshaModal: React.FC<NameAshaModalProps> = ({ isOpen, onClose }) => {
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomName, setIsCustomName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();

  const handleNameSelect = (name: string) => {
    setSelectedName(name);
    setIsCustomName(false);
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomName(e.target.value);
    setSelectedName(e.target.value);
    setIsCustomName(true);
  };

  const handleSave = async () => {
    if (!selectedName) return;
    
    setIsSaving(true);
    
    try {
      localStorage.setItem('ashaName', selectedName);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSaving(false);
      onClose(); // Close the modal first
      setShowLoading(true); // Then show loading
      
      // Wait for 3 seconds to show the loading animation
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error saving name:', error);
      setIsSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !showLoading && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]"
              onClick={onClose}
            />

            {/* Modal Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[100] p-4"
            >
              <div className="w-full max-w-lg bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
                {/* Header */}
                <div className="flex-shrink-0 flex items-center gap-2 p-4 border-b border-white/20 bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bot className="w-8 h-8 text-[#D946EF]" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Name Your Companion</h3>
                      <p className="text-xs text-white/60">Make it personal</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto text-white/60 hover:text-white"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold text-white">
                      By the way...
                    </h2>
                    <p className="text-white/80 text-lg">
                      Would you like to give me a name that feels more 'you'?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {suggestedNames.map((suggestion, index) => (
                      <motion.button
                        key={suggestion.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        onClick={() => handleNameSelect(suggestion.name)}
                        className={cn(
                          "w-full p-4 rounded-xl text-left transition-all duration-300",
                          selectedName === suggestion.name && !isCustomName
                            ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white shadow-lg"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        )}
                      >
                        <span className="text-2xl mr-3">{suggestion.emoji}</span>
                        <span className="text-lg font-medium">{suggestion.name}</span>
                      </motion.button>
                    ))}

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="relative"
                    >
                      <input
                        type="text"
                        placeholder="Type your own name..."
                        value={customName}
                        onChange={handleCustomNameChange}
                        className="w-full p-4 rounded-xl bg-white/10 border border-white/20 
                                 focus:border-[#D946EF] focus:ring-2 focus:ring-[#D946EF]/20
                                 text-white placeholder:text-white/40
                                 transition-all duration-300"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
                        ✨
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-white/20 bg-black/20">
                  <Button
                    onClick={handleSave}
                    disabled={!selectedName || isSaving}
                    className={cn(
                      "w-full py-4 rounded-xl font-medium text-lg transition-all duration-300",
                      isSaving
                        ? "bg-white/20 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#7C3AED] hover:to-[#C026D3]"
                    )}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          ⏳
                        </motion.span>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Let's roll! <span className="ml-2">✨</span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading Animation */}
      <AnimatePresence>
        {showLoading && <LoadingAnimation />}
      </AnimatePresence>
    </>
  );
}; 