import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  icon, 
  children,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-4">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};