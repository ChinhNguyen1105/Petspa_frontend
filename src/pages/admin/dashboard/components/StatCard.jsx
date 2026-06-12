import React from 'react';

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-pet-orange transition-all duration-300">
      <div className="space-y-2">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <h3 className="text-2xl font-black text-pet-blue group-hover:text-pet-orange transition-colors">
          {value}
        </h3>
      </div>
      <div className={`p-4 rounded-xl ${iconBg} ${iconColor}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;