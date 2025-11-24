import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
        {title}
      </h3>
      
      <p className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        {value}
      </p>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {trend}
      </p>
    </div>
  );
};

export default StatsCard;