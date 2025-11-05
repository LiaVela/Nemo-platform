import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
      
      <h3 className="text-gray-600 text-sm font-medium mb-1">
        {title}
      </h3>
      
      <p className="text-3xl font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
};

export default StatsCard;