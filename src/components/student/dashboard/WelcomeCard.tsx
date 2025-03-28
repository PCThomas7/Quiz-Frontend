import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeCardProps {
  userName: string;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName }) => {
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">{greeting}, {userName}!</h1>
          <p className="opacity-90">Welcome to your quiz dashboard. Track your progress and upcoming quizzes here.</p>
        </div>
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            ease: "easeInOut" 
          }}
          className="hidden md:block"
        >
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};